/* =====================================================
   POCKETPILOT
   Smart Personal Finance Tracker
===================================================== */

/* ================= DATA ================= */

let incomeData =
    JSON.parse(localStorage.getItem("pocketpilot_income")) || [];

let expenseData =
    JSON.parse(localStorage.getItem("pocketpilot_expenses")) || [];

let savingGoals =
    JSON.parse(localStorage.getItem("pocketpilot_goals")) || [];

let budget =
    Number(localStorage.getItem("pocketpilot_budget")) || 0;


/* ================= ELEMENTS ================= */

const incomeName = document.getElementById("incomeName");
const incomeAmount = document.getElementById("incomeAmount");
const incomeDate = document.getElementById("incomeDate");
const incomeNote = document.getElementById("incomeNote");

const expenseName = document.getElementById("expenseName");
const expenseCategory = document.getElementById("expenseCategory");
const expenseAmount = document.getElementById("expenseAmount");
const expenseDate = document.getElementById("expenseDate");
const expenseNote = document.getElementById("expenseNote");

const goalName = document.getElementById("goalName");
const goalTarget = document.getElementById("goalTarget");
const goalDeadline = document.getElementById("goalDeadline");


/* ================= PAKISTAN DATE/TIME ================= */

function getPakistanDateTime() {

    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    const parts = formatter.formatToParts(now);

    const values = {};

    parts.forEach(function (part) {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    });

    return {
        date:
            `${values.year}-${values.month}-${values.day}`,

        time:
            `${values.hour}:${values.minute}:${values.second} ${values.dayPeriod}`,

        timestamp:
            now.getTime()
    };
}


function getToday() {
    return getPakistanDateTime().date;
}


function getCurrentTime() {
    return getPakistanDateTime().time;
}


function getCurrentMonth() {
    return getToday().substring(0, 7);
}


/* ================= DEFAULT DATES ================= */

if (incomeDate) {
    incomeDate.value = getToday();
}

if (expenseDate) {
    expenseDate.value = getToday();
}


/* ================= SAVE DATA ================= */

function saveData() {

    localStorage.setItem(
        "pocketpilot_income",
        JSON.stringify(incomeData)
    );

    localStorage.setItem(
        "pocketpilot_expenses",
        JSON.stringify(expenseData)
    );

    localStorage.setItem(
        "pocketpilot_goals",
        JSON.stringify(savingGoals)
    );

    localStorage.setItem(
        "pocketpilot_budget",
        String(budget)
    );
}


/* ================= MONEY FORMAT ================= */

function money(value) {

    return "Rs. " +
        Number(value || 0).toLocaleString("en-PK");
}


/* ================= TOTALS ================= */

function getTotalIncome() {

    return incomeData.reduce(function (total, item) {

        return total + Number(item.amount || 0);

    }, 0);
}


function getTotalExpenses() {

    return expenseData.reduce(function (total, item) {

        return total + Number(item.amount || 0);

    }, 0);
}


function getSavings() {

    return getTotalIncome() - getTotalExpenses();
}


/* ================= MONTHLY TOTALS ================= */

function getCurrentMonthExpenses() {

    const currentMonth = getCurrentMonth();

    return expenseData
        .filter(function (item) {

            return item.date &&
                item.date.startsWith(currentMonth);

        })
        .reduce(function (sum, item) {

            return sum + Number(item.amount || 0);

        }, 0);
}


function getCurrentMonthIncome() {

    const currentMonth = getCurrentMonth();

    return incomeData
        .filter(function (item) {

            return item.date &&
                item.date.startsWith(currentMonth);

        })
        .reduce(function (sum, item) {

            return sum + Number(item.amount || 0);

        }, 0);
}


/* ================= UPDATE DASHBOARD ================= */

function updateDashboard(showBudgetAlert = false) {

    const totalIncome = getTotalIncome();
    const totalExpenses = getTotalExpenses();
    const savings = totalIncome - totalExpenses;


    const incomeTotal =
        document.getElementById("incomeTotal");

    if (incomeTotal) {
        incomeTotal.textContent = money(totalIncome);
    }


    const expenseTotal =
        document.getElementById("expenseTotal");

    if (expenseTotal) {
        expenseTotal.textContent = money(totalExpenses);
    }


    const balance =
        document.getElementById("balance");

    if (balance) {
        balance.textContent = money(savings);
    }


    const savingsIncome =
        document.getElementById("savingsIncome");

    if (savingsIncome) {
        savingsIncome.textContent = money(totalIncome);
    }


    const savingsExpense =
        document.getElementById("savingsExpense");

    if (savingsExpense) {
        savingsExpense.textContent = money(totalExpenses);
    }


    const savingsTotal =
        document.getElementById("savingsTotal");

    if (savingsTotal) {
        savingsTotal.textContent = money(savings);
    }


    updateBudget(showBudgetAlert);
    renderIncome();
    renderExpenses();
    renderSavingGoals();
    updateMonthlyReport();
    updateSmartDecision();

    saveData();
}


/* ================= ADD INCOME ================= */

const addIncomeButton =
    document.getElementById("addIncomeButton");

if (addIncomeButton) {

    addIncomeButton.addEventListener("click", function () {

        const source =
            incomeName.value.trim();

        const amount =
            Number(incomeAmount.value);

        const date =
            incomeDate.value;

        const note =
            incomeNote.value.trim();


        if (!source) {
            alert("Please enter income source.");
            return;
        }


        if (!amount || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }


        if (!date) {
            alert("Please select a date.");
            return;
        }


        const pakistanDateTime =
            getPakistanDateTime();


        incomeData.push({

            id: Date.now(),

            source: source,

            amount: amount,

            date: date,

            time: pakistanDateTime.time,

            createdAt: pakistanDateTime.timestamp,

            note: note || "—"

        });


        incomeName.value = "";
        incomeAmount.value = "";
        incomeNote.value = "";
        incomeDate.value = getToday();


        updateDashboard();

        alert("Income added successfully.");

    });
}


/* ================= RENDER INCOME ================= */

function renderIncome() {

    const list =
        document.getElementById("incomeList");

    if (!list) return;

    list.innerHTML = "";


    if (incomeData.length === 0) {

        list.innerHTML = `
            <div class="empty-row">
                No income records yet.
            </div>
        `;

        return;
    }


    const records =
        [...incomeData].sort(function (a, b) {

            return getRecordTimestamp(b) -
                getRecordTimestamp(a);

        });


    records.forEach(function (item) {

        const row =
            document.createElement("div");

        row.className =
            "income-table income-row";


        row.innerHTML = `

            <div>
                ${escapeHTML(item.source)}
            </div>

            <div class="amount">
                ${money(item.amount)}
            </div>

            <div>
                ${formatDate(item.date)}
            </div>

            <div>
                ${escapeHTML(item.time || "—")}
            </div>

            <div>
                ${escapeHTML(item.note || "—")}
            </div>

            <div class="action-buttons">

                <button
                    type="button"
                    onclick="editIncome(${item.id})">
                    ✏️
                </button>

                <button
                    type="button"
                    onclick="deleteIncome(${item.id})">
                    🗑️
                </button>

            </div>
        `;


        list.appendChild(row);

    });
}


/* ================= EDIT INCOME ================= */

function editIncome(id) {

    const item =
        incomeData.find(function (income) {

            return income.id === id;

        });


    if (!item) return;


    const newSource =
        prompt("Income Source:", item.source);

    if (newSource === null) return;


    const newAmount =
        prompt("Amount:", item.amount);

    if (newAmount === null) return;


    if (
        newSource.trim() === "" ||
        !Number(newAmount) ||
        Number(newAmount) <= 0
    ) {

        alert("Invalid information.");
        return;

    }


    item.source = newSource.trim();
    item.amount = Number(newAmount);

    updateDashboard();
}


/* ================= DELETE INCOME ================= */

function deleteIncome(id) {

    if (!confirm("Delete this income record?")) {
        return;
    }


    incomeData =
        incomeData.filter(function (item) {

            return item.id !== id;

        });


    updateDashboard();
}


/* ================= ADD EXPENSE ================= */

const addExpenseButton =
    document.getElementById("addExpenseButton");

if (addExpenseButton) {

    addExpenseButton.addEventListener("click", function () {

        const name =
            expenseName.value.trim();

        const category =
            expenseCategory.value;

        const amount =
            Number(expenseAmount.value);

        const date =
            expenseDate.value;

        const note =
            expenseNote.value.trim();


        if (!name) {
            alert("Please enter expense name.");
            return;
        }


        if (!category) {
            alert("Please select a category.");
            return;
        }


        if (!amount || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }


        if (!date) {
            alert("Please select a date.");
            return;
        }


        const pakistanDateTime =
            getPakistanDateTime();


        expenseData.push({

            id: Date.now(),

            name: name,

            category: category,

            amount: amount,

            date: date,

            time: pakistanDateTime.time,

            createdAt: pakistanDateTime.timestamp,

            note: note || "—"

        });


        expenseName.value = "";
        expenseCategory.value = "";
        expenseAmount.value = "";
        expenseNote.value = "";
        expenseDate.value = getToday();


        updateDashboard(true);

        alert("Expense added successfully.");

    });
}


/* ================= RENDER EXPENSES ================= */

function renderExpenses() {

    const list =
        document.getElementById("expenseList");

    if (!list) return;


    list.innerHTML = "";


    let records =
        [...expenseData];


    const searchElement =
        document.getElementById("searchExpense");

    const categoryElement =
        document.getElementById("filterCategory");

    const sortElement =
        document.getElementById("sortExpenses");


    const search =
        searchElement
            ? searchElement.value.toLowerCase().trim()
            : "";


    const category =
        categoryElement
            ? categoryElement.value
            : "";


    const sort =
        sortElement
            ? sortElement.value
            : "";


    if (search) {

        records =
            records.filter(function (item) {

                return item.name
                    .toLowerCase()
                    .includes(search);

            });
    }


    if (category) {

        records =
            records.filter(function (item) {

                return item.category === category;

            });
    }


    if (sort === "newest") {

        records.sort(function (a, b) {

            return getRecordTimestamp(b) -
                getRecordTimestamp(a);

        });

    } else if (sort === "oldest") {

        records.sort(function (a, b) {

            return getRecordTimestamp(a) -
                getRecordTimestamp(b);

        });

    } else if (sort === "low") {

        records.sort(function (a, b) {

            return Number(a.amount) -
                Number(b.amount);

        });

    } else if (sort === "high") {

        records.sort(function (a, b) {

            return Number(b.amount) -
                Number(a.amount);

        });

    } else if (sort === "name") {

        records.sort(function (a, b) {

            return a.name.localeCompare(b.name);

        });

    } else {

        records.sort(function (a, b) {

            return getRecordTimestamp(b) -
                getRecordTimestamp(a);

        });
    }


    if (records.length === 0) {

        list.innerHTML = `
            <div class="empty-row">
                No expense records found.
            </div>
        `;

        return;
    }


    records.forEach(function (item) {

        const row =
            document.createElement("div");

        row.className =
            "expense-table expense-row";


        row.innerHTML = `

            <div>
                ${escapeHTML(item.name)}
            </div>

            <div>
                ${escapeHTML(item.category)}
            </div>

            <div class="amount">
                ${money(item.amount)}
            </div>

            <div>
                ${formatDate(item.date)}
            </div>

            <div>
                ${escapeHTML(item.time || "—")}
            </div>

            <div class="action-buttons">

                <button
                    type="button"
                    onclick="editExpense(${item.id})">
                    ✏️
                </button>

                <button
                    type="button"
                    onclick="deleteExpense(${item.id})">
                    🗑️
                </button>

            </div>
        `;


        list.appendChild(row);

    });
}


/* ================= RECORD TIMESTAMP ================= */

function getRecordTimestamp(item) {

    if (item.createdAt) {

        if (typeof item.createdAt === "number") {
            return item.createdAt;
        }


        const timestamp =
            new Date(item.createdAt).getTime();


        if (!isNaN(timestamp)) {
            return timestamp;
        }
    }


    return Number(item.id) || 0;
}


/* ================= EDIT EXPENSE ================= */

function editExpense(id) {

    const item =
        expenseData.find(function (expense) {

            return expense.id === id;

        });


    if (!item) return;


    const newName =
        prompt("Expense Name:", item.name);

    if (newName === null) return;


    const newAmount =
        prompt("Amount:", item.amount);

    if (newAmount === null) return;


    if (
        newName.trim() === "" ||
        !Number(newAmount) ||
        Number(newAmount) <= 0
    ) {

        alert("Invalid information.");
        return;
    }


    item.name = newName.trim();
    item.amount = Number(newAmount);

    updateDashboard();
}


/* ================= DELETE EXPENSE ================= */

function deleteExpense(id) {

    if (!confirm("Delete this expense record?")) {
        return;
    }


    expenseData =
        expenseData.filter(function (item) {

            return item.id !== id;

        });


    updateDashboard();
}


/* ================= FILTERS ================= */

const searchExpense =
    document.getElementById("searchExpense");

if (searchExpense) {
    searchExpense.addEventListener(
        "input",
        renderExpenses
    );
}


const filterCategory =
    document.getElementById("filterCategory");

if (filterCategory) {
    filterCategory.addEventListener(
        "change",
        renderExpenses
    );
}


const sortExpenses =
    document.getElementById("sortExpenses");

if (sortExpenses) {
    sortExpenses.addEventListener(
        "change",
        renderExpenses
    );
}


const clearFilterButton =
    document.getElementById("clearFilterButton");

if (clearFilterButton) {
    clearFilterButton.addEventListener(
        "click",
        clearFilters
    );
}


const clearFiltersButton =
    document.getElementById("clearFiltersButton");

if (clearFiltersButton) {
    clearFiltersButton.addEventListener(
        "click",
        clearFilters
    );
}


function clearFilters() {

    if (searchExpense) {
        searchExpense.value = "";
    }

    if (filterCategory) {
        filterCategory.value = "";
    }

    if (sortExpenses) {
        sortExpenses.value = "";
    }

    renderExpenses();
}


/* ================= BUDGET ================= */

const setBudgetButton =
    document.getElementById("setBudgetButton");

if (setBudgetButton) {

    setBudgetButton.addEventListener("click", function () {

        const budgetInput =
            document.getElementById("budgetAmount");

        const value =
            Number(budgetInput.value);


        if (!value || value <= 0) {

            alert("Please enter a valid budget.");
            return;
        }


        budget = value;

        saveData();
        updateDashboard();

        budgetInput.value = "";

        alert("Monthly budget set successfully.");

    });
}


/* ================= UPDATE BUDGET ================= */

function updateBudget(showAlert = false) {

    const budgetTotal =
        document.getElementById("budgetTotal");

    const budgetUsed =
        document.getElementById("budgetUsed");

    const budgetRemaining =
        document.getElementById("budgetRemaining");

    const budgetProgress =
        document.getElementById("budgetProgress");

    const budgetPercentage =
        document.getElementById("budgetPercentage");


    if (
        !budgetTotal ||
        !budgetUsed ||
        !budgetRemaining ||
        !budgetProgress ||
        !budgetPercentage
    ) {
        return;
    }


    const used =
        getCurrentMonthExpenses();

    const remaining =
        budget - used;


    budgetTotal.textContent =
        money(budget);

    budgetUsed.textContent =
        money(used);

    budgetRemaining.textContent =
        money(Math.max(remaining, 0));


    let rawPercentage = 0;


    if (budget > 0) {

        rawPercentage =
            (used / budget) * 100;

    }


    const displayPercentage =
        Math.min(
            Math.max(rawPercentage, 0),
            100
        );


    budgetProgress.style.width =
        displayPercentage + "%";


    if (budget <= 0) {

        budgetPercentage.textContent =
            "Set a monthly budget to start tracking.";

        budgetPercentage.className =
            "budget-status";

        return;
    }


    if (rawPercentage > 100) {

        const overAmount =
            used - budget;


        budgetPercentage.innerHTML = `
            <strong>⚠️ 100% used</strong>
            <br>
            <span>
                You are ${money(overAmount)}
                over your monthly budget.
            </span>
        `;

        budgetPercentage.className =
            "budget-status budget-over";


        if (showAlert) {

            alert(
                "⚠️ Budget Alert!\n\n" +
                "You have exceeded your monthly budget by " +
                money(overAmount) +
                "."
            );
        }

        return;
    }


    if (rawPercentage >= 80) {

        budgetPercentage.innerHTML = `
            <strong>
                ⚠️ ${Math.round(displayPercentage)}% used
            </strong>
            <br>
            <span>
                Your budget is getting close to its limit.
                ${money(remaining)} remaining.
            </span>
        `;

        budgetPercentage.className =
            "budget-status budget-warning";

        return;
    }


    budgetPercentage.innerHTML = `
        ${Math.round(displayPercentage)}% used
        • ${money(remaining)} remaining
    `;

    budgetPercentage.className =
        "budget-status";
}


/* ================= AFFORDABILITY ================= */

const checkAffordButton =
    document.getElementById("checkAffordButton");

if (checkAffordButton) {

    checkAffordButton.addEventListener(
        "click",
        function () {

            const itemInput =
                document.getElementById("affordItem");

            const amountInput =
                document.getElementById("affordAmount");

            const result =
                document.getElementById("affordResult");


            const item =
                itemInput.value.trim();

            const amount =
                Number(amountInput.value);


            if (
                !item ||
                !amount ||
                amount <= 0
            ) {

                result.className =
                    "decision-result decision-warning";

                result.textContent =
                    "Please enter the item and price.";

                return;
            }


            const savings =
                getSavings();


            if (amount <= savings) {

                result.className =
                    "decision-result decision-good";

                result.innerHTML = `
                    <strong>✅ You can afford it.</strong>
                    After buying ${escapeHTML(item)},
                    you would still have
                    ${money(savings - amount)}
                    available.
                `;

            } else {

                result.className =
                    "decision-result decision-danger";

                result.innerHTML = `
                    <strong>⚠️ Better wait for now.</strong>
                    Your current available savings are
                    ${money(savings)}.
                `;
            }
        }
    );
}


/* ================= SMART DECISION ================= */

function updateSmartDecision() {

    const result =
        document.getElementById("smartDecisionResult");

    if (!result) return;


    const savings =
        getSavings();

    const monthlyExpenses =
        getCurrentMonthExpenses();

    const totalIncome =
        getTotalIncome();


    if (totalIncome === 0) {

        result.className =
            "decision-result decision-warning";

        result.innerHTML = `
            <strong>
                📌 Start by adding your income.
            </strong>
            <br>
            Once you add income and expenses,
            PocketPilot will automatically analyze
            your finances.
        `;

        return;
    }


    if (budget > 0) {

        const remaining =
            budget - monthlyExpenses;


        if (remaining < 0) {

            result.className =
                "decision-result decision-danger";

            result.innerHTML = `
                <strong>
                    ⚠️ You are over your monthly budget.
                </strong>
                <br>
                You are ${money(Math.abs(remaining))}
                over your budget.
            `;

            return;
        }


        const usedPercentage =
            (monthlyExpenses / budget) * 100;


        if (usedPercentage >= 80) {

            result.className =
                "decision-result decision-warning";

            result.innerHTML = `
                <strong>
                    ⚠️ Your budget is getting close to its limit.
                </strong>
                <br>
                You have ${money(remaining)}
                remaining for this month.
            `;

            return;
        }
    }


    if (savings > 0) {

        result.className =
            "decision-result decision-good";

        result.innerHTML = `
            <strong>
                ✅ Your current financial position looks positive.
            </strong>
            <br>
            You have saved ${money(savings)} so far.
            Keep monitoring your expenses and continue saving.
        `;

    } else {

        result.className =
            "decision-result decision-warning";

        result.innerHTML = `
            <strong>
                📌 Your expenses are currently higher than your income.
            </strong>
            <br>
            Try to reduce unnecessary spending
            and review your expenses.
        `;
    }
}


/* ================= MONTHLY REPORT ================= */

function updateMonthlyReport() {

    const report =
        document.getElementById("monthlyReport");

    if (!report) return;


    const currentMonth =
        getCurrentMonth();


    const monthlyIncome =
        incomeData
            .filter(function (item) {

                return item.date &&
                    item.date.startsWith(currentMonth);

            })
            .reduce(function (sum, item) {

                return sum + Number(item.amount || 0);

            }, 0);


    const monthlyExpense =
        expenseData
            .filter(function (item) {

                return item.date &&
                    item.date.startsWith(currentMonth);

            })
            .reduce(function (sum, item) {

                return sum + Number(item.amount || 0);

            }, 0);


    const monthlySavings =
        monthlyIncome - monthlyExpense;


    const expenseCount =
        expenseData.filter(function (item) {

            return item.date &&
                item.date.startsWith(currentMonth);

        }).length;


    report.innerHTML = `

        <div class="report-box">
            <span>Monthly Income</span>
            <strong>${money(monthlyIncome)}</strong>
        </div>

        <div class="report-box">
            <span>Monthly Expenses</span>
            <strong>${money(monthlyExpense)}</strong>
        </div>

        <div class="report-box">
            <span>Monthly Savings</span>
            <strong>${money(monthlySavings)}</strong>
        </div>

        <div class="report-box">
            <span>Expense Records</span>
            <strong>${expenseCount}</strong>
        </div>

    `;
}


/* ================= SAVING GOALS ================= */

const addGoalButton =
    document.getElementById("addGoalButton");

if (addGoalButton) {

    addGoalButton.addEventListener(
        "click",
        function () {

            const name =
                goalName.value.trim();

            const target =
                Number(goalTarget.value);

            const deadline =
                goalDeadline.value;


            if (!name) {
                alert("Please enter goal name.");
                return;
            }


            if (!target || target <= 0) {
                alert("Please enter target amount.");
                return;
            }


            const pakistanDateTime =
                getPakistanDateTime();


            savingGoals.push({

                id: Date.now(),

                name: name,

                target: target,

                deadline: deadline || "",

                createdDate:
                    pakistanDateTime.date,

                createdTime:
                    pakistanDateTime.time,

                createdAt:
                    pakistanDateTime.timestamp

            });


            goalName.value = "";
            goalTarget.value = "";
            goalDeadline.value = "";


            updateDashboard();

            alert("Saving goal created successfully.");

        }
    );
}


/* ================= RENDER GOALS ================= */

function renderSavingGoals() {

    const list =
        document.getElementById("savingGoalsList");

    if (!list) return;


    list.innerHTML = "";


    if (savingGoals.length === 0) {

        list.innerHTML = `
            <p style="color:#777; margin-top:15px;">
                No saving goals created yet.
            </p>
        `;

        return;
    }


    const currentSavings =
        Math.max(getSavings(), 0);


    savingGoals.forEach(function (goal) {

        const target =
            Number(goal.target) || 1;


        const percentage =
            Math.min(
                (currentSavings / target) * 100,
                100
            );


        const card =
            document.createElement("div");

        card.className =
            "saving-goal";


        card.innerHTML = `

            <div class="goal-top">

                <div>

                    <h3>
                        🎯 ${escapeHTML(goal.name)}
                    </h3>

                    <span>
                        Target: ${money(goal.target)}
                    </span>

                </div>

                <button
                    type="button"
                    class="secondary-button"
                    onclick="deleteGoal(${goal.id})">
                    🗑️
                </button>

            </div>

            <div class="goal-progress">
                <div style="width:${percentage}%"></div>
            </div>

            <div class="goal-details">

                <span>
                    ${money(currentSavings)} saved
                </span>

                <strong>
                    ${Math.round(percentage)}%
                </strong>

            </div>

            ${
                goal.deadline
                    ? `
                        <small>
                            Target Date:
                            ${formatDate(goal.deadline)}
                        </small>
                    `
                    : ""
            }

        `;


        list.appendChild(card);

    });
}


/* ================= DELETE GOAL ================= */

function deleteGoal(id) {

    if (!confirm("Delete this saving goal?")) {
        return;
    }


    savingGoals =
        savingGoals.filter(function (goal) {

            return goal.id !== id;

        });


    updateDashboard();
}


/* ================= FINANCIAL CHAT ================= */

const financialChatButton =
    document.getElementById("financialChatButton");

if (financialChatButton) {

    financialChatButton.addEventListener(
        "click",
        sendFinancialMessage
    );
}


const financialChatInput =
    document.getElementById("financialChatInput");

if (financialChatInput) {

    financialChatInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendFinancialMessage();

            }

        }
    );
}


/* ================= SEND CHAT ================= */

function sendFinancialMessage() {

    const input =
        document.getElementById("financialChatInput");

    if (!input) return;


    const message =
        input.value.trim();


    if (!message) return;


    addChatMessage(message, "user");

    input.value = "";


    setTimeout(function () {

        const reply =
            getFinancialReply(message);

        addChatMessage(reply, "bot");

    }, 300);
}


/* ================= ADD CHAT ================= */

function addChatMessage(message, type) {

    const messages =
        document.getElementById("chatMessages");

    if (!messages) return;


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "chat-message " +
        (
            type === "user"
                ? "user-message"
                : "bot-message"
        );


    if (type === "user") {

        wrapper.innerHTML = `

            <div class="chat-bubble">
                <p>${escapeHTML(message)}</p>
            </div>

        `;

    } else {

        wrapper.innerHTML = `

            <div class="chat-avatar">🤖</div>

            <div class="chat-bubble">

                <strong>
                    PocketPilot Assistant
                </strong>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        `;
    }


    messages.appendChild(wrapper);

    messages.scrollTop =
        messages.scrollHeight;
}


/* ================= CHAT REPLY ================= */

function getFinancialReply(message) {

    const text =
        message.toLowerCase();


    const income =
        getTotalIncome();

    const expenses =
        getTotalExpenses();

    const savings =
        getSavings();

    const monthlyExpenses =
        getCurrentMonthExpenses();


    if (
        text.includes("balance") ||
        text.includes("available")
    ) {

        return `
Your current balance is ${money(savings)}.
        `;
    }


    if (
        text.includes("income") ||
        text.includes("earning") ||
        text.includes("salary")
    ) {

        return `
Your total income is ${money(income)}.
        `;
    }


    if (
        text.includes("expense") ||
        text.includes("spend") ||
        text.includes("spent")
    ) {

        return `
Your total expenses are ${money(expenses)}.
This month's expenses are ${money(monthlyExpenses)}.
        `;
    }


    if (
        text.includes("saving") ||
        text.includes("save")
    ) {

        return `
Your current savings are ${money(savings)}.
        `;
    }


    if (text.includes("budget")) {

        if (budget <= 0) {

            return `
You have not set a monthly budget yet.
            `;
        }


        const remaining =
            budget - monthlyExpenses;


        if (remaining < 0) {

            return `
⚠️ You are over your monthly budget by
${money(Math.abs(remaining))}.
            `;
        }


        return `
Your monthly budget is ${money(budget)}.
You have ${money(remaining)} remaining.
        `;
    }


    if (text.includes("goal")) {

        if (savingGoals.length === 0) {

            return `
You have not created a saving goal yet.
            `;
        }


        return `
You currently have ${savingGoals.length}
saving goal(s).
        `;
    }


    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {

        return `
Hello! 👋
I can tell you about your balance,
income, expenses, savings, budget
and saving goals.
        `;
    }


    return `
I can help with:

• Balance
• Income
• Expenses
• Savings
• Budget
• Saving Goals

Try asking:
"What is my balance?"
    `;
}


/* ================= EXPORT CSV ================= */

const exportCSVButton =
    document.getElementById("exportCSVButton");

if (exportCSVButton) {

    exportCSVButton.addEventListener(
        "click",
        exportCSV
    );
}


function exportCSV() {

    let csv =
        "Type,Name,Category,Amount,Date,Time,Note\n";


    incomeData.forEach(function (item) {

        csv +=
            `"Income","${csvSafe(item.source)}","","${item.amount}","${item.date}","${csvSafe(item.time)}","${csvSafe(item.note)}"\n`;

    });


    expenseData.forEach(function (item) {

        csv +=
            `"Expense","${csvSafe(item.name)}","${csvSafe(item.category)}","${item.amount}","${item.date}","${csvSafe(item.time)}","${csvSafe(item.note)}"\n`;

    });


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "PocketPilot-Financial-Data.csv";


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


function csvSafe(value) {

    return String(value ?? "")
        .replace(/"/g, '""');
}


/* ================= RESET ALL ================= */

const resetAllButton =
    document.getElementById("resetAllButton");

if (resetAllButton) {

    resetAllButton.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to delete ALL PocketPilot data?"
                );


            if (!confirmed) return;


            incomeData = [];
            expenseData = [];
            savingGoals = [];
            budget = 0;


            saveData();

            updateDashboard();


            const chatMessages =
                document.getElementById("chatMessages");


            if (chatMessages) {

                chatMessages.innerHTML = `

                    <div class="chat-message bot-message">

                        <div class="chat-avatar">
                            🤖
                        </div>

                        <div class="chat-bubble">

                            <strong>
                                PocketPilot Assistant
                            </strong>

                            <p>
                                Your data has been reset.
                                You can start adding new records.
                            </p>

                        </div>

                    </div>

                `;
            }

        }
    );
}


/* ================= DARK MODE ================= */

const darkModeButton =
    document.getElementById("darkModeButton");


if (darkModeButton) {

    darkModeButton.addEventListener(
        "click",
        function () {

            document.body.classList.toggle("dark");


            const dark =
                document.body.classList.contains("dark");


            localStorage.setItem(
                "pocketpilot_dark",
                String(dark)
            );


            this.textContent =
                dark
                    ? "☀️ Light Mode"
                    : "🌙 Dark Mode";

        }
    );
}


if (
    localStorage.getItem("pocketpilot_dark") === "true"
) {

    document.body.classList.add("dark");


    if (darkModeButton) {

        darkModeButton.textContent =
            "☀️ Light Mode";

    }
}


/* ================= LIVE PAKISTAN CLOCK ================= */

/* =====================================================
   LIVE PAKISTAN CLOCK
   ===================================================== */

function updateClock() {

    const currentTime = document.getElementById("currentTime");

    if (!currentTime) {
        return;
    }

    const now = new Date();

    const pakistanTime = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    currentTime.textContent = pakistanTime;
}


/* Start clock immediately */
updateClock();

/* Update every second */
setInterval(updateClock, 1000);


/* ================= DATE FORMAT ================= */

function formatDate(dateString) {

    if (!dateString) return "—";


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {
        return dateString;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


/* ================= HTML SAFETY ================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================= INITIAL LOAD ================= */

updateDashboard();
