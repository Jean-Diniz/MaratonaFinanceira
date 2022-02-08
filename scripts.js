const Modal = () => {
    document
        .querySelector('.modal-overlay')
        .classList
        .toggle('active')
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("JDFinance:transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("JDFinance:transactions", JSON.stringify(transactions));
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload();
    },

    incomes() {
        let sumIncomes = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                sumIncomes += transaction.amount;
            }
        });
        return Utils.formatCurrency(sumIncomes);
    },


    expenses() {
        let sumExpenses = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                sumExpenses += transaction.amount;
            }
        });
        return Utils.formatCurrency(-sumExpenses);
    },

    total() {
        let total = 0;
        Transaction.all.forEach((transaction) => {
            total += transaction.amount;
        });
        return Utils.formatCurrency(total);
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Transaction.incomes();
        document
            .getElementById('expenseDisplay')
            .innerHTML = Transaction.expenses();
        document
            .getElementById('totalDisplay')
            .innerHTML = Transaction.total();
    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100
        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value;
    },

    formatAmount(value, radio) {
        radio = Number(radio)
        value = value * 100 * radio
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatRadio(radio) {
        let selected;
        radio.forEach((choose) => {
            if (choose.checked) {
                selected = choose.value
            }
        })
        return selected
    }
};



const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    radio: document.querySelectorAll('input[name="radios"]'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            radio: Form.radio,
        }
    },

    formatValues() {
        let { description, amount, date, radio } = Form.getValues();

        radio = Utils.formatRadio(radio);
        amount = Utils.formatAmount(amount, radio);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        let radio = document.querySelector('input[name="radios"]:checked')
        radio.checked = false
    },

    submit(event) {
        event.preventDefault();
        try {
            const transaction = Form.formatValues();
            Transaction.add(transaction)
            Form.clearFields();
            Modal();
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance();
        Storage.set(Transaction.all);
    },

    reload() {
        DOM.clearTransaction()
        App.init()
    }
}
App.init();
