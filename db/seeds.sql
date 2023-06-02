INSERT INTO department (id, name)
VALUES (1, "IT"),
       (2, "Sales"),
       (3, "Finance"),
       (4, "Marketing"),
       (5, "Engineering"),
       (6, "Human Resources"),
       (7, "Research & Development"),
       (8, "Administration");



       INSERT INTO role (id, title, salary, department_id)
VALUES (1, "Manager", 150000, 1),
       (2, "Developer", 110000, 1),
       (3, "Salesperson", 70000, 2),
       (4, "Engineer", 120000, 5),
       (5, "HR Assistant", 75000, 6),
       (6, "Secretary", 80000, 8),
       (7, "Accountant", 90000, 3),
       (8, "Graphic Designer", 100000, 4),
       (9, "Outcomes Researcher", 120000, 7);



INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, "Robinson", "Santos", 1, null),
       (2, "Peter", "Smith", 1, null),
       (3, "Andy", "Jones", 2, 1),
       (4, "Greg", "Willians", 5, null),
       (5, "Jason", "Brown", 6, null),
       (6, "Marry", "Taylor", 8, 1),
       (7, "Derik", "Johnson", 3, null),
       (8, "Paul", "Lee", 4, null),
       (9, "Ben", "Thompson", 7, 5);


