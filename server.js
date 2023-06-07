// Import necessary packages
const mysql = require('mysql2');
const inquirer = require('inquirer');
const express = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ******* Create a MySQL connection *********
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'Mysql0421!',
    database: 'business_db'
  },
  console.log(`Connected to the business_db database.`)
);

// ******* Connect to the database ********
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the business database');
  startApp();
});

// **** Colors to style the terminal ******
const yellow = '\x1b[33m%s\x1b[0m';
const blue = '\x1b[34m%s\x1b[0m';
const green = '\x1b[32m%s\x1b[0m';
const red = '\x1b[31m%s\x1b[0m';


// ******* Function to start the application ********
function startApp() {
  inquirer
    .prompt([
      {
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View All Departments',
          'View All Roles',
          'View All Employees',
          'Add Department',
          'Add Role',
          'Add Employee',
          'Update Employee Role',
          '** Further Options **',
          'Clear',
          'Exit',
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case 'View All Departments':
          viewAllDepartments();
          break;
        case 'View All Roles':
          viewAllRoles();
          break;
        case 'View All Employees':
          viewAllEmployees();
          break;
        case 'Add Department':
          addDepartment();
          break;
        case 'Add Role':
          addRole();
          break;
        case 'Add Employee':
          addEmployee();
          break;
        case 'Update Employee Role':
          updateEmployeeRole();
          break;


        case '** Further Options **':
          inquirer
            .prompt([
              {
                name: 'action',
                type: 'list',
                choices: [
                  'View Employees by Manager',
                  'View Employees by Department',
                  'Update Employees Manager',
                  'Delete Employee',
                  'Delete Department',
                  'Delete Role',
                  'Consult Department Salary',
                  'Return'
                ]
              },
            ])
            .then((answer) => {
              switch (answer.action) {
                case 'View Employees by Manager':
                  viewEmployeesByManager();
                  break;
                case 'View Employees by Department':
                  viewEmployeesByDepartment();
                  break;
                case 'Update Employees Manager':
                  updateEmployeesManager();
                  break;
                case 'Delete Employee':
                  deleteEmployee();
                  break;
                case 'Delete Department':
                  deleteDepartment();
                  break;
                case 'Delete Role':
                  deleteRole();
                  break;
                 case 'Consult Department Salary': 
                  departmentSalary();
                  break;
                case 'Return':
                  console.log('\n\n\n');
                  startApp();
                  break;
              }
            });
          break;

        case 'Clear':
          console.clear();
          startApp();
          break;
        case 'Exit':
          db.end();
          break;
        default:
          console.log('Invalid option');
          startApp();
      }
    });
}


/*
---------------------------------------------------
----------------- VIEW FUNCTIONS ------------------
---------------------------------------------------
*/

// ******* Function to view all departments ********
function viewAllDepartments() {
  db.query(`SELECT department.id AS ID,
  department.name AS Department FROM department`,

    (err, res) => {
      if (err) throw err;
      console.table(res);
      startApp();
    });
}

// ******** Function to view all roles ********
function viewAllRoles() {
  const query = `
    SELECT role.id AS ID,
    role.title AS Title,
    department.name AS Department,
    role.salary AS Salary
    FROM role
    JOIN department ON role.department_id = department.id
    ORDER BY id
  `;

  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}


// ******* Function to view all employees *******
function viewAllEmployees() {
  const query = `
    SELECT employee.id AS ID,
    employee.first_name AS First_Name,
    employee.last_name AS Last_Name, 
    role.title AS Role,
    department.name AS Department,
    role.salary AS Salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    ORDER BY first_name
  `;

  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}


// ****** Function to view employees by Manager *******
function viewEmployeesByManager() {
  db.query('SELECT * FROM employee WHERE role_id IN (SELECT id FROM role WHERE title = "Manager")', (err, managers) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'manager_id',
          type: 'list',
          message: "Select the employee's manager: ",
          choices: [
            ...managers.map((manager) => ({
              name: `${manager.first_name} ${manager.last_name}`,
              value: manager.id,
            })),
            {
              name: 'null',
              value: null,
            },
          ],
        },
      ])

      .then((answer) => {
        db.query(
          `
          SELECT employee.id AS ID,
          employee.first_name AS First_Name,
          employee.last_name AS Last_Name, 
          role.title AS Role,
          department.name AS Department,
          role.salary AS Salary, 
          CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
          FROM employee
          JOIN role ON employee.role_id = role.id
          JOIN department ON role.department_id = department.id
          LEFT JOIN employee AS manager ON employee.manager_id = manager.id
          WHERE employee.manager_id = ?
          `,
          [answer.manager_id],
          (err, res) => {
            if (err) throw err;
            console.table(res);
            startApp();
          }
        );
      });
  });
}


// ***** Function to view employees by Department *******
function viewEmployeesByDepartment() {
  db.query('SELECT * FROM department', (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'department_id',
          type: 'list',
          message: "Select the employee's department: ",
          choices: [
            ...departments.map((department) => ({
              name: `${department.name}`,
              value: department.id,
            })),
            {
              name: 'null',
              value: null,
            },
          ],
        },
      ])

      .then((answer) => {
        db.query(
          `
          SELECT employee.id AS ID,
          employee.first_name AS First_Name,
          employee.last_name AS Last_Name, 
          role.title AS Role,
          department.name AS Department,
          role.salary AS Salary, 
          CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
          FROM employee
          JOIN role ON employee.role_id = role.id
          JOIN department ON role.department_id = department.id
          LEFT JOIN employee AS manager ON employee.manager_id = manager.id
          WHERE department.id = ?
          `,
          [answer.department_id],
          (err, res) => {
            if (err) throw err;
            console.table(res);
            startApp();
          }
        );
      });
  });
}



/*
---------------------------------------------------
----------------- ADD FUNCTIONS -------------------
---------------------------------------------------
*/


// ****** Function to add a department *******
function addDepartment() {
  inquirer
    .prompt([
      {
        name: 'name',
        type: 'input',
        message: 'Enter the name of the department: ',
      },
    ])
    .then((answer) => {
      db.query(
        'INSERT INTO department (name) VALUES (?)',
        [answer.name],
        (err) => {
          if (err) throw err;
          console.log(green, `\n${answer.name} department added successfully!\n`);
          startApp();
        }
      );
    });
}

// ****** Function to add a role *******
function addRole() {
  db.query('SELECT * FROM department', (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'title',
          type: 'input',
          message: 'Enter the title of the role: ',
        },
        {
          name: 'salary',
          type: 'number',
          message: 'Enter the salary for the role: ',
        },
        {
          name: 'department_id',
          type: 'list',
          message: 'Select the department for the role: ',
          choices: departments.map((department) => ({
            name: department.name,
            value: department.id,
          })),
        },
      ])
      .then((answer) => {
        db.query(
          'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
          [answer.title, answer.salary, answer.department_id],
          (err) => {
            if (err) throw err;
            console.log(green, `\n ${answer.title} role added successfully!\n`);
            startApp();
          }
        );
      });
  });
}


// ****** Function to add an employee *******
function addEmployee() {
  db.query('SELECT * FROM role', (err, roles) => {
    if (err) throw err;

    db.query('SELECT * FROM employee WHERE role_id IN (SELECT id FROM role WHERE title = "Manager")', (err, managers) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: 'first_name',
            type: 'input',
            message: "Enter the employee's first name: ",
          },
          {
            name: 'last_name',
            type: 'input',
            message: "Enter the employee's last name: ",
          },
          {
            name: 'role_id',
            type: 'list',
            message: "Select the employee's role: ",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
          {
            name: 'manager_id',
            type: 'list',
            message: "Select the employee's manager: ",
            choices: [
              ...managers.map((manager) => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id,
              })),
              {
                name: 'null',
                value: null,
              },
            ],
          },
        ])
        .then((answer) => {
          db.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
            [answer.first_name, answer.last_name, answer.role_id, answer.manager_id],
            (err) => {
              if (err) throw err;
              console.log(green, `\n ${answer.first_name} ${answer.last_name} added successfully!\n`);
              startApp();
            }
          );
        });
    });
  });
}



/*
-----------------------------------------------------
----------------- UPDATE FUNCTIONS ------------------
-----------------------------------------------------
*/


// ****** Function to update an employee role ********
function updateEmployeeRole() {
  db.query('SELECT * FROM employee', (err, employees) => {
    if (err) throw err;

    db.query('SELECT * FROM role', (err, roles) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: 'employee_id',
            type: 'list',
            message: 'Select the employee to update: ',
            choices: employees.map((employee) => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            })),
          },
          {
            name: 'role_id',
            type: 'list',
            message: 'Select the new role for the employee: ',
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
        ])
        .then((answer) => {
          db.query(
            'UPDATE employee SET role_id = ? WHERE id = ?',
            [answer.role_id, answer.employee_id],
            (err) => {
              if (err) throw err;
              console.log(yellow, '\nEmployee role updated successfully!\n');
              startApp();
            }
          );
        });
    });
  });
}


// ****** Function to update an employee manager ********
function updateEmployeesManager() {
  db.query('SELECT * FROM employee', (err, employees) => {
    if (err) throw err;

    db.query('SELECT * FROM employee WHERE role_id IN (SELECT id FROM role WHERE title = "Manager")', (err, managers) => {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: 'employee_id',
            type: 'list',
            message: 'Select the employee to update: ',
            choices: employees.map((employee) => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            })),
          },
          {
            name: 'manager_id',
            type: 'list',
            message: "Select the employee's manager: ",
            choices: [
              ...managers.map((manager) => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id,
              })),
              {
                name: 'null',
                value: null,
              },
            ],
          },
        ])
        .then((answer) => {
          db.query(
            'UPDATE employee SET manager_id = ? WHERE id = ?',
            [answer.manager_id, answer.employee_id],
            (err) => {
              if (err) throw err;
              console.log(yellow, '\nEmployee manager updated successfully!\n');
              startApp();
            }
          );
        });
    });
  });
}



/*
-----------------------------------------------------
----------------- DELETE FUNCTIONS ------------------
-----------------------------------------------------
*/


// ****** Function to delete an employee *******
function deleteEmployee() {
  db.query('SELECT * FROM employee', (err, employees) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'employee_id',
          type: 'list',
          message: 'Select the employee to delete: ',
          choices: employees.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          })),
        },
      ])

      .then((answer) => {
        db.query(
          'DELETE FROM employee WHERE id = ?',
          [answer.employee_id],
          (err) => {
            if (err) throw err;
            console.log(red, `\nEmployee deleted!\n`);
            startApp();
          }
        );
      });
  });
}

// NOT WORKING PROPERLY YET
// ****** Function to delete a department *******
function deleteDepartment() {
  db.query('SELECT * FROM department', (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'department_id',
          type: 'list',
          message: 'Select the department to delete: ',
          choices: departments.map((department) => ({
            name: `${department.name}`,
            value: department.id,
          })),
        },
      ])
      .then((answer) => {

        // Update role
        db.query(
          'UPDATE role SET department_id = ? WHERE department_id = ?',
          [1000, answer.department_id], //defined in seeds.sql
          (err) => {
            if (err) throw err;

            // Delete department
            db.query(
              'DELETE FROM department WHERE id = ?',
              [answer.department_id],
              (err) => {
                if (err) throw err;
                console.log(red, '\nDepartment deleted!\n');
                startApp();
              }
            );
          }
        );
      });
  });
}



// NOT WORKING PROPERLY YET
// ****** Function to delete a role *******
function deleteRole() {
  db.query('SELECT * FROM role', (err, roles) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'role_id',
          type: 'list',
          message: 'Select the role to delete: ',
          choices: roles.map((role) => ({
            name: `${role.title}`,
            value: role.id,
          })),
        },
      ])
      .then((answer) => {
        // Update employees
        
        db.query(
          'UPDATE employee SET role_id = ? WHERE role_id = ?',
          [1001, answer.role_id], //1001 defined in seeds.sql
          (err) => {
            if (err) throw err;

            // Delete the role
            db.query(
              'DELETE FROM role WHERE id = ?',
              [answer.role_id],
              (err) => {
                if (err) throw err;
                console.log(red, '\nRole deleted!\n');
                startApp();
              }
            );
          }
        );
      });
  });
}


/*
-----------------------------------------------------
----------------- CONSULT FUNCTIONS -----------------
-----------------------------------------------------
*/


// Lesson 24 to develop the function for SUM
// ****** Function to SUM salary of employees in the department *******
function departmentSalary() {
  db.query('SELECT * FROM department', (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'department_id',
          type: 'list',
          message: 'Select the department to consult: ',
          choices: departments.map((department) => ({
            name: `${department.name}`,
            value: department.id,
          })),
        },
      ])
      .then((answer) => {
        // Consult employee by role_id then join to department_id
        db.query(
          `SELECT department.name AS Department,
          SUM(role.salary) AS Combined_Salary_Department
          FROM department
          INNER JOIN role ON department.id = role.department_id
          INNER JOIN employee ON role.id = employee.role_id
          WHERE role.department_id = ?`,
          [answer.department_id],
          (err, res) => {
            if (err) throw err;
            console.table(res);
            startApp();
          }
        );
      });
  });
}

