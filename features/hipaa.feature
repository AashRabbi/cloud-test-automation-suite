Feature: HIPAA Compliance\n  Scenario: Verify data encryption\n    Given sensitive data is entered\n    When the data is processed\n    Then it is encrypted per HIPAA standards
