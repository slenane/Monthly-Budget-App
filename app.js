// BUDGET CONTROLLER
let budgetController = (function () {
    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function (type) {
        let sum = 0;

        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new item based on type
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            // push new item into our data structure
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            let ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // 1. Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            // 2: Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(
                    (data.totals.exp / data.totals.inc) * 100
                );
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            let allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },
    };
})();

// USER INTERFACE CONTROLLER
let UIController = (function () {
    let DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };

    let formatNumber = function (num, type) {
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];

        if (int.length > 3) {
            int =
                int.substr(0, int.length - 3) +
                "," +
                int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    let nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput: function () {
            return {
                // return an object with the values
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMstrings.inputValue).value
                ),
            };
        },

        addListItem: function (obj, type) {
            let html, element;
            // create HTML string with placholder text
            if (type === "inc") {
                element = DOMstrings.incomeContainer;

                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMstrings.expenseContainer;

                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace placeholder text with actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

            // insert HTML into DOM
            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {
            // Select element to be removed
            let element = document.getElementById(selectorID);

            // You can only remove a child so you have to move up and select the child from above
            element.parentNode.removeChild(element);
        },

        clearFields: function () {
            let fields, fieldsArr;

            fields = document.querySelectorAll(
                DOMstrings.inputDescription + ", " + DOMstrings.inputValue
            );

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            let type;
            obj.budget > -0.1 ? (type = "inc") : (type = "exp");

            document.querySelector(
                DOMstrings.budgetLabel
            ).textContent = formatNumber(obj.budget, type);
            document.querySelector(
                DOMstrings.incomeLabel
            ).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(
                DOMstrings.expensesLabel
            ).textContent = formatNumber(obj.totalExp, "exp");

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    "N/A";
            }
        },

        displayPercentages: function (percentages) {
            let fields = document.querySelectorAll(
                DOMstrings.expensesPercLabel
            );

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "N/A";
                }
            });
        },

        displayMonth: function () {
            let now, month, months, year;

            now = new Date();
            year = now.getFullYear();
            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            month = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent =
                months[month] + ", " + year;
        },

        changeType: function () {
            let fields = document.querySelectorAll(
                DOMstrings.inputType +
                    "," +
                    DOMstrings.inputDescription +
                    "," +
                    DOMstrings.inputValue
            );

            nodeListForEach(fields, function (current) {
                current.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },

        getDOMstrings: function () {
            return DOMstrings;
        },
    };
})();

// GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {
    let setUpEventListeners = function () {
        let DOM = UICtrl.getDOMstrings();

        document
            .querySelector(DOM.inputBtn)
            .addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (e) {
            // .which is used for compatability with older browsers that don't have the keyCode property
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);

        document
            .querySelector(DOM.inputType)
            .addEventListener("change", UICtrl.changeType);
    };

    let updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = function () {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = function () {
        let input, newItem;
        // 1. Get the field input data
        input = UICtrl.getinput();

        if (
            input.description !== "" &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function (e) {
        let itemID, splitID, type, ID;

        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("Application has started");
            UICtrl.displayMonth();
            // Reset UI values on page load
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setUpEventListeners();
        },
    };
})(budgetController, UIController);

controller.init();
