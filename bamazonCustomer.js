const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
});

function start() {
    connection.query("SELECT * FROM products", function (error, results) {
        if (error) throw error;
        for (let i = 0; i < results.length; i++) {
            console.log(`----------------------------------------------------------------------------------------------------------`);
            console.log(` ID: ${results[i].item_id} | Item: ${results[i].product_name} | Price: ${results[i].price} `);
        };
        console.log(``);
        makePurchase(); 
    });
};

function makePurchase() {
    inquirer.prompt([
        {
            type: "input",
            name: "whichProduct",
            message: "Please enter the ID number of the item you'd like to buy."
        },
        {
            type: "input",
            name: "howMany",
            message: "How many would you like to buy?"
        }
    ])
    .then(function(response) {
        let purchasedItem = parseInt(response.whichProduct);
        let howMany = parseInt(response.howMany);
        connection.query("SELECT * FROM products WHERE ?", { item_id: purchasedItem}, function (err, res) {
            if (err) {
                throw err
            }
            else if (res[0].stock_quantity >= howMany) {
                console.log("Purchase successful!");
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: res[0].stock_quantity - howMany
                        },
                        {
                            item_id: purchasedItem
                        }
                    ],
                    function(err) {
                        if (err) throw err;
                    })
            }
            else {
                console.log("Not enough in stock! Try fewer items or make a different selection.");
                start();
            };
        })
    })
};