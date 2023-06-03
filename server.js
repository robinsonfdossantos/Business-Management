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
          'Other Filter Options',
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


        case 'Other Filter Options':
          inquirer
            .prompt([
              {
                name: 'action',
                type: 'list',
                choices: [
                  'View Employees by Manager',
                ]
              },
            ])
            .then((answer) => {
              switch (answer.action) {
                case 'View Employees by Manager':
                  viewEmployeesByManager();
              }
            });
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
          console.log('Department added successfully!');
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
            console.log('Role added successfully!');
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
              console.log('Employee added successfully!');
              startApp();
            }
          );
        });
    });
  });
}




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
              console.log('Employee role updated successfully!');
              startApp();
            }
          );
        });
    });
  });
}