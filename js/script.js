document.getElementById('add').addEventListener('click', function openForm() {
  popup.style.display = 'block';
});

document.getElementById('close').addEventListener('click', function closeForm() {
  document.getElementById('popup').style.display = 'none';
});

document.getElementById('inputbooktitle').addEventListener('focus', function () {
  this.value = '';
});

document.getElementById('inputauthor').addEventListener('focus', function () {
  this.value = '';
});

document.getElementById('inputyear').addEventListener('focus', function () {
  this.value = '';
});

document.getElementById('searchBookTitle').addEventListener('focus', function () {
  this.value = '';
});

const books = [];
const RENDER_EVENT = 'render-books';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('form');

  submitForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addNewBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addNewBook() {
  const ibookTitle = document.getElementById('inputbooktitle').value;
  const iauthor = document.getElementById('inputauthor').value;
  const iyear = document.getElementById('inputyear').value;
  const iscompleted = document.getElementById('inputisCompleted').checked;
  const bookID = newid();

  const newBook = newbookdata(bookID, ibookTitle, iauthor, iyear, iscompleted);
  books.push(newBook);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function newid() {
  return +new Date();
}

function newbookdata(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const notCompleted = document.getElementById('not-completed');
  notCompleted.innerHTML = '';

  const Completed = document.getElementById('completed');
  Completed.innerHTML = '';

  for (const listbook of books) {
    const newBookElement = makenewBook(listbook);
    if (!listbook.isCompleted) {
      notCompleted.append(newBookElement);
    } else {
      Completed.append(newBookElement);
    }
  }
});

const checkbox = document.getElementById('inputisCompleted');
const span = document.getElementById('submitSpan');

checkbox.addEventListener('change', function (e) {
  if (this.checked) {
    span.innerText = 'Selesai dibaca';
  } else {
    span.innerText = 'Belum selesai dibaca';
  }
});

function makenewBook(newBook) {
  const texttitle = document.createElement('h3');
  texttitle.innerText = newBook.title;

  const textauthor = document.createElement('p');
  textauthor.innerText = 'Penulis: ' + newBook.author;

  const textyear = document.createElement('p');
  textyear.innerText = 'Tahun: ' + newBook.year;

  const status = document.createElement('div');
  status.classList.add('action-button');

  const newBookContainer = document.createElement('article');
  newBookContainer.classList.add('box');

  const container = document.createElement('div');
  container.append(newBookContainer);
  container.setAttribute('id', `title-${newBook.id}`);

  if (newBook.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button', 'box-button');
    undoButton.innerText = 'Belum Selesai';

    function undoBook(bookID) {
      const booksTarget = findBooks(bookID);

      if (booksTarget == null) return;

      booksTarget.isCompleted = false;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }

    undoButton.addEventListener('click', function () {
      undoBook(newBook.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button', 'box-button');
    deleteButton.innerText = 'Delete';

    deleteButton.addEventListener('click', function () {
      deletebook(newBook.id);
    });

    status.append(undoButton, deleteButton);
  } else {
    const completedButton = document.createElement('button');
    completedButton.classList.add('completed-button', 'box-button');
    completedButton.innerText = 'Selesai';
    completedButton.addEventListener('click', function () {
      newBookisCompleted(newBook.id);
      saveData();
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button', 'box-button');
    deleteButton.innerText = 'Delete';

    deleteButton.addEventListener('click', function () {
      deletebook(newBook.id);
    });

    status.append(completedButton, deleteButton);
  }

  newBookContainer.append(texttitle, textauthor, textyear, status);

  return container;
}

function newBookisCompleted(bookID) {
  const booksTarget = findBooks(bookID);
  if (booksTarget == null) return;

  booksTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deletebook(bookID) {
  let text = confirm('Apakah anda yakin?');
  const booksTarget = findBookIndex(bookID);

  if (booksTarget === -1) return;

  if (text) {
    books.splice(booksTarget, 1);
  } else {
    return;
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBooks(bookID) {
  for (const listbook of books) {
    if (listbook.id === bookID) {
      return listbook;
    }
  }
  return null;
}

function findBookIndex(bookID) {
  for (const i in books) {
    if (books[i].id === bookID) {
      return i;
    }
  }
  return -1;
}

const SAVED_EVENT = 'SAVED_BOOKS';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.getElementById('searchBook').addEventListener('submit', function (e) {
  e.preventDefault();
  const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookList = document.querySelectorAll('article > h3');
  for (const book of bookList) {
    if (book.innerText.toLowerCase().includes(searchBook)) {
      book.parentElement.style.display = 'block';
    } else {
      book.parentElement.style.display = 'none';
    }
  }
});
