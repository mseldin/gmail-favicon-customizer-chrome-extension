// Options page logic without Angular or eval

document.addEventListener('DOMContentLoaded', () => {
  const acctList = document.getElementById('acct_list');
  const addDiv = document.getElementById('add');
  const addButton = document.getElementById('add_account');
  const saveButton = document.getElementById('save');

  let accounts = [];

  function render() {
    while (acctList.children.length > 1) {
      acctList.removeChild(acctList.lastChild);
    }

    accounts.forEach((acct, index) => {
      const div = document.createElement('div');
      div.className = 'acct';

      const del = document.createElement('button');
      del.className = 'delete';
      del.title = 'Delete this account';
      del.textContent = 'x';
      del.addEventListener('click', () => {
        accounts.splice(index, 1);
        render();
      });
      div.appendChild(del);

      const emailLabel = document.createElement('label');
      const emailItalic = document.createElement('i');
      emailItalic.textContent = 'Email Address:';
      emailLabel.appendChild(emailItalic);
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.value = acct.email || '';
      emailInput.addEventListener('input', (e) => {
        acct.email = e.target.value;
      });
      emailLabel.appendChild(emailInput);
      div.appendChild(emailLabel);
      div.appendChild(document.createElement('br'));

      if (acct.favicon && !acct.showUpload) {
        const favLabel = document.createElement('label');
        const favItalic = document.createElement('i');
        favItalic.textContent = 'Favicon';
        favLabel.appendChild(favItalic);
        const img = document.createElement('img');
        img.width = 16;
        img.height = 16;
        img.src = acct.favicon;
        favLabel.appendChild(img);
        const change = document.createElement('a');
        change.href = '#!';
        change.textContent = 'change';
        change.addEventListener('click', (e) => {
          e.preventDefault();
          acct.showUpload = true;
          render();
        });
        favLabel.appendChild(document.createTextNode('\u00a0\u00a0\u00a0'));
        favLabel.appendChild(change);
        div.appendChild(favLabel);
      }

      if (!acct.favicon || acct.showUpload) {
        const uploadLabel = document.createElement('label');
        const uploadItalic = document.createElement('i');
        uploadItalic.textContent = 'Favicon Upload:';
        uploadLabel.appendChild(uploadItalic);
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            acct.favicon = ev.target.result;
            acct.showUpload = false;
            render();
          };
          reader.readAsDataURL(file);
        });
        uploadLabel.appendChild(fileInput);
        div.appendChild(uploadLabel);
      }

      acctList.appendChild(div);
    });
  }

  function addAccount() {
    accounts.push({ email: '', favicon: '', showUpload: true });
    render();
  }

  addButton.addEventListener('click', addAccount);

  saveButton.addEventListener('click', () => {
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    const accts = accounts
      .filter(a => a.email && a.favicon)
      .map(a => ({
        email: String(a.email).toLowerCase(),
        favicon: String(a.favicon)
      }));
    chrome.storage.local.set({ gmail_accounts: accts }, () => {
      saveButton.textContent = 'Saved!';
      setTimeout(() => {
        saveButton.textContent = 'Save';
        saveButton.disabled = false;
      }, 3000);
    });
  });

  chrome.storage.local.get('gmail_accounts', (items) => {
    accounts = Array.isArray(items.gmail_accounts)
      ? items.gmail_accounts.map(a => ({ ...a, showUpload: false }))
      : [];
    if (accounts.length === 0) {
      addAccount();
    } else {
      render();
    }
    addDiv.style.display = 'block';
    saveButton.disabled = false;
  });
});
