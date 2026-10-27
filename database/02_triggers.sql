-- =====================================================================
-- AdLedger – 02_triggers.sql
-- Business rules that the database enforces automatically.
-- Run after 01_schema.sql (and before 04_seed.sql so seed data is checked).
-- =====================================================================
USE adledger_db;

DROP PROCEDURE IF EXISTS sp_refresh_invoice_status;
DROP TRIGGER IF EXISTS trg_payment_before_insert;
DROP TRIGGER IF EXISTS trg_payment_after_insert;
DROP TRIGGER IF EXISTS trg_payment_after_update;
DROP TRIGGER IF EXISTS trg_payment_after_delete;
DROP TRIGGER IF EXISTS trg_lead_status_log;
DROP TRIGGER IF EXISTS trg_sale_converts_lead;
DROP TRIGGER IF EXISTS trg_sale_lead_check;

DELIMITER $$

-- ---------------------------------------------------------------------
-- Recalculates an invoice's status from the payments made against it:
--   paid >= total  -> Paid
--   paid >  0      -> Partial
--   past due date  -> Overdue
--   otherwise      -> Unpaid
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_refresh_invoice_status(IN p_invoice_id INT)
BEGIN
    DECLARE v_paid  DECIMAL(12, 2);
    DECLARE v_total DECIMAL(12, 2);
    DECLARE v_due   DATE;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid
      FROM payment WHERE invoice_id = p_invoice_id;

    SELECT total_amount, due_date INTO v_total, v_due
      FROM invoice WHERE invoice_id = p_invoice_id;

    UPDATE invoice
       SET status = CASE
                        WHEN v_paid >= v_total     THEN 'Paid'
                        WHEN v_paid > 0            THEN 'Partial'
                        WHEN v_due < CURDATE()     THEN 'Overdue'
                        ELSE 'Unpaid'
                    END
     WHERE invoice_id = p_invoice_id;
END$$

-- Reject a payment that would take the invoice above its total.
CREATE TRIGGER trg_payment_before_insert
BEFORE INSERT ON payment
FOR EACH ROW
BEGIN
    DECLARE v_paid  DECIMAL(12, 2);
    DECLARE v_total DECIMAL(12, 2);

    SELECT COALESCE(SUM(amount), 0) INTO v_paid FROM payment WHERE invoice_id = NEW.invoice_id;
    SELECT total_amount INTO v_total FROM invoice WHERE invoice_id = NEW.invoice_id;

    IF v_paid + NEW.amount > v_total THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Payment exceeds the remaining invoice balance';
    END IF;
END$$

-- Invoice becomes Paid / Partial automatically when payments change.
CREATE TRIGGER trg_payment_after_insert
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    CALL sp_refresh_invoice_status(NEW.invoice_id);
END$$

CREATE TRIGGER trg_payment_after_update
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
    CALL sp_refresh_invoice_status(NEW.invoice_id);
    IF OLD.invoice_id <> NEW.invoice_id THEN
        CALL sp_refresh_invoice_status(OLD.invoice_id);
    END IF;
END$$

CREATE TRIGGER trg_payment_after_delete
AFTER DELETE ON payment
FOR EACH ROW
BEGIN
    CALL sp_refresh_invoice_status(OLD.invoice_id);
END$$

-- Every change of a lead's status is written to lead_status_log.
CREATE TRIGGER trg_lead_status_log
AFTER UPDATE ON `lead`
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO lead_status_log (lead_id, old_status, new_status)
        VALUES (NEW.lead_id, OLD.status, NEW.status);
    END IF;
END$$

-- A sale cannot be recorded for a lead that was marked Lost.
CREATE TRIGGER trg_sale_lead_check
BEFORE INSERT ON sale
FOR EACH ROW
BEGIN
    IF (SELECT status FROM `lead` WHERE lead_id = NEW.lead_id) = 'Lost' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot record a sale for a lost lead';
    END IF;
END$$

-- Recording a sale marks its lead as Converted (which is then logged).
CREATE TRIGGER trg_sale_converts_lead
AFTER INSERT ON sale
FOR EACH ROW
BEGIN
    UPDATE `lead` SET status = 'Converted'
     WHERE lead_id = NEW.lead_id AND status <> 'Converted';
END$$

DELIMITER ;
