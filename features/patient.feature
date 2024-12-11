Feature: Patient Record Management\n  Scenario: Verify patient record creation\n    Given the user is logged in\n    When the user creates a patient record\n    Then the record is saved successfully
