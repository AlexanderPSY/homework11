const app = document.getElementById('app')
const url = 'http://localhost:3000/users'
let maxId = 0
let newUser = false
let addUserBtn=null

update(url)

function update(url) {
    fetch(url).then(response => response.json()).then(renderTable).then(addListeners)
}

function renderTable(dataArr) {
    const tableHeader = " <table border=\"1\">" +
        "<caption>Данные пользователей</caption>" +
        "<tr>" +
        "<th>ID</th>" +
        "<th>Имя</th>" +
        "<th>Фамилия</th>" +
        "<th>Email</th>" +
        "<th>Номер телефона</th>" +
        "<th>Действия</th>" +
        "</tr>"
    maxId = dataArr.reduce((max, current) => {
        if (max < current.id) return current.id
        return max
    }, 0)
    app.innerHTML = dataArr.reduce((users, currentUser) => users + `<tr id="${currentUser.id}"><td>${currentUser.id}</td>
                   <td>${currentUser.name}</td><td>${currentUser.surname}</td><td>${currentUser.email}</td>
                   <td>${currentUser.phone}</td><td><button class="edit" id="${currentUser.id}edit">edit</button>
                   <button class="delete" id="${currentUser.id}delete">delete</button></td></tr>`, tableHeader) +
        '</table>' + '<button class="add" id="add">Add User</button>'
}

function addListeners() {
    const editArr = document.getElementsByClassName('edit')
    const deleteArr = document.getElementsByClassName('delete');
    [].forEach.call(editArr, element => element.onclick = editUser(parseInt(element.id)));
    [].forEach.call(deleteArr, element => element.onclick = deleteUser(parseInt(element.id)))
    addUserBtn = document.getElementById('add')
    addUserBtn.onclick = addUser(maxId + 1)
}

function deleteUser(id) {
    return () => {
        return fetch(url + '/' + id, {
            method: 'delete'
        }).then(response => update(url))
    }
}

function editUser(id) {
    return () => {

        const row = document.getElementById(id)
        const idNames = ['id', 'name', 'surname', 'email', 'phone', 'edit'];
        [].forEach.call(row.cells, element =>
            element.innerHTML = `<input type="text" id="${idNames.shift()}" value="${element.innerText}">`)
        row.cells[5].innerHTML = `<button id="save-button">save</button>
                   <button id="cancel-button">cancel</button>`

        const cancelButton = document.getElementById('cancel-button')
        cancelButton.onclick = cancelUser(id)

        const saveButton = document.getElementById('save-button')
        saveButton.onclick = saveUser(id)
    }
}

function saveUser(id) {
    return () => {
        if (newUser) {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: id})
            }).then(() => console.log("create new user"))
        }

        const row = document.getElementById(id);
        let data = {
            id: row.cells[0].children[0].value,
            name: row.cells[1].children[0].value,
            surname: row.cells[2].children[0].value,
            email: row.cells[3].children[0].value,
            phone: row.cells[4].children[0].value
        }
        cancelUser(id)()
        console.log(JSON.stringify(data))
        newUser = false
        fetch(url + '/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(() => {
            update(url)
        })

    }
}

function cancelUser(id) {
    return () => {
        update(url)
        newUser = false
    }
}

function addUser(id) {
    return () => {
        addUserBtn.style.display='none'
        maxId++
        newUser = true
        const usersTable = document.getElementsByTagName("table");
        let row = document.createElement("tr")
        row.id = id
        row.innerHTML = `<td>${id}</td><td></td><td></td><td></td><td></td><td></td>`
        usersTable[0].appendChild(row)

        editUser(id)()

        addListeners()
    }
}
