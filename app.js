document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#book-form");
    const list = document.querySelector("#book-list");
    let currentEditIsbn = null;

    function createList(title, author, isbn) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${title}</td>
            <td>${author}</td>
            <td>${isbn}</td>
            <td>
                <a class="btn btn-sm btn-info edit">Edit</a>
                <a class="btn btn-danger btn-sm delete">X</a>
            </td>
        `;
        list.appendChild(row);
    }

    function addBookToStorage(title, author, isbn) {
        let books = localStorage.getItem("books") ? JSON.parse(localStorage.getItem("books")) : [];
        books.push({ title, author, isbn });
        localStorage.setItem("books", JSON.stringify(books));
    }

    function clearAllFields() {
        document.querySelector("#title").value = "";
        document.querySelector("#author").value = "";
        document.querySelector("#isbn").value = "";
    }

    function showAlert(msg, className) {
        let div = document.createElement("div");
        div.className = "alert alert-" + className;
        div.appendChild(document.createTextNode(msg));
        const container = document.querySelector(".container");
        container.insertBefore(div, form);
        setTimeout(() => div.remove(), 3000);
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        let title = document.querySelector("#title").value;
        let author = document.querySelector("#author").value;
        let isbn = document.querySelector("#isbn").value;

        if (title.length === 0 || author.length === 0 || isbn.length === 0) {
            showAlert("Please Fill all the Fields!!", "danger");
            return;
        }

        showAlert("Book Added Successfully", "success");
        createList(title, author, isbn);
        clearAllFields();
        addBookToStorage(title, author, isbn);
    });

    list.addEventListener('click', function (e) {
        // Delete Book
        if (e.target.classList.contains("delete")) {
            const row = e.target.closest("tr");
            const isbn = row.children[2].innerText;
            row.remove();

            let books = JSON.parse(localStorage.getItem("books")) || [];
            books = books.filter(book => book.isbn !== isbn);
            localStorage.setItem("books", JSON.stringify(books));

            showAlert("Book Removed Successfully", "danger");
        }

        // Edit Book
        if (e.target.classList.contains("edit")) {
            const row = e.target.closest("tr");
            const title = row.children[0].innerText;
            const author = row.children[1].innerText;
            const isbn = row.children[2].innerText;

            document.querySelector("#edit-title").value = title;
            document.querySelector("#edit-author").value = author;
            document.querySelector("#edit-isbn").value = isbn;
            currentEditIsbn = isbn;

            $('#editModal').modal('show');
        }
    });

    document.querySelector("#save-edit").addEventListener("click", function () {
        const newTitle = document.querySelector("#edit-title").value.trim();
        const newAuthor = document.querySelector("#edit-author").value.trim();
        const isbn = currentEditIsbn;

        if (!newTitle || !newAuthor) {
            alert("Please fill in all fields!");
            return;
        }

        // Update UI
        const rows = document.querySelectorAll("#book-list tr");
        rows.forEach(row => {
            if (row.children[2].innerText === isbn) {
                row.children[0].innerText = newTitle;
                row.children[1].innerText = newAuthor;
            }
        });

        // Update localStorage
        let books = JSON.parse(localStorage.getItem("books"));
        books = books.map(book => {
            if (book.isbn === isbn) {
                return { title: newTitle, author: newAuthor, isbn };
            }
            return book;
        });
        localStorage.setItem("books", JSON.stringify(books));

        $('#editModal').modal('hide');
        showAlert("Book updated successfully!", "success");
    });

    // Load books on page load
    let books = JSON.parse(localStorage.getItem("books")) || [];
    books.forEach(book => {
        createList(book.title, book.author, book.isbn);
    });

    // Search functionality
    document.querySelector("#search").addEventListener("input", function (e) {
        const query = e.target.value.trim().toLowerCase();
        const rows = document.querySelectorAll("#book-list tr");
        let found = false;

        rows.forEach(row => {
            const title = row.children[0].innerText.toLowerCase();
            const author = row.children[1].innerText.toLowerCase();
            const isbn = row.children[2].innerText.toLowerCase();

            if (query === title || query === author || query === isbn) {
                row.style.display = "";
                found = true;
            } else {
                row.style.display = "none";
            }
        });

        const msg = document.getElementById("search-message");
        if (!query) {
            msg.innerText = "";
        } else if (found) {
            msg.innerText = "✅ Match found!";
            msg.className = "text-success mt-2";
        } else {
            msg.innerText = "❌ No exact match found.";
            msg.className = "text-danger mt-2";
        }
    });
});
