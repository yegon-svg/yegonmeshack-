
(function () {
  'use strict';

  /* ---------- Storage helpers ---------- */
  const storage = {
    get(key, def = null) {
      try { return JSON.parse(localStorage.getItem(key) || 'null') ?? def; } catch { return def; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem(key); }
  };

  /* ---------- Seed sample data if missing ---------- */
  function seedIfNeeded() {
    if (!storage.get('bikes')) {
      storage.set('bikes', [
        { id: 1, name: 'Mountain Bike Pro', type: 'Mountain', price: 50, image: 'mountain-bike-1.jpeg', available: true, description: 'Perfect for off-road trails' },
        { id: 2, name: 'Road Bike Speed', type: 'Road', price: 80, image: 'road-bike-1.jpeg', available: true, description: 'Fast and lightweight for campus' },
        { id: 3, name: 'Electric Bike Plus', type: 'E-Bike', price: 150, image: 'electric-1.jpeg', available: true, description: 'Eco-friendly with long battery' }
      ]);
    }
    if (!storage.get('users')) storage.set('users', []);
    if (!storage.get('admins')) storage.set('admins', []);
    if (!storage.get('rentals')) storage.set('rentals', []);
    if (!storage.get('transactions')) storage.set('transactions', []);
    if (!storage.get('messages')) storage.set('messages', []);
  }

  /* ---------- Utilities ---------- */
  function q(id) { return document.getElementById(id); }
  function escapeHtml(s = '') { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function nextId(list) { return list && list.length ? Math.max(...list.map(i => i.id)) + 1 : 1; }
  function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function validatePhone(phone) { return /^(\+254|0)[1-9]\d{8}$/.test(phone.replace(/\s/g, '')); }

  /* ---------- Auth (users) ---------- */
  function getCurrentUser() { return storage.get('currentUser', null); }
  function setCurrentUser(u) { storage.set('currentUser', u); }
  function clearCurrentUser() { storage.remove('currentUser'); }
  function updateUserInList(u) {
    const users = storage.get('users', []);
    const idx = users.findIndex(x => x.email === u.email);
    if (idx > -1) { users[idx] = u; storage.set('users', users); }
  }

  function signupUser({ fullname, email, password, phone }) {
    const users = storage.get('users', []);
    if (!fullname || fullname.length < 3) throw new Error('Full name must be at least 3 characters');
    if (!validateEmail(email)) throw new Error('Invalid email format');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    if (!validatePhone(phone)) throw new Error('Invalid phone format (use format: 0712345678)');
    if (users.find(u => u.email === email)) throw new Error('Email already registered');

    const user = {
      id: Date.now(),
      fullname,
      email,
      password: btoa(password),
      phone,
      profilePhoto: null,
      createdAt: new Date().toISOString(),
      rentals: 0
    };
    users.push(user);
    storage.set('users', users);
    setCurrentUser({ id: user.id, fullname: user.fullname, email: user.email, phone: user.phone, profilePhoto: user.profilePhoto });
    return user;
  }

  function loginUser({ email, password }) {
    const users = storage.get('users', []);
    const u = users.find(x => x.email === email);
    if (!u || atob(u.password) !== password) throw new Error('Invalid email or password');
    setCurrentUser({ id: u.id, fullname: u.fullname, email: u.email, phone: u.phone, profilePhoto: u.profilePhoto, rentals: u.rentals || 0 });
    return u;
  }

  /* ---------- Admin auth ---------- */
  function getAdmins() { return storage.get('admins', []); }
  function setAdmins(a) { storage.set('admins', a); }
  function getCurrentAdmin() { return storage.get('currentAdmin', null); }
  function setCurrentAdmin(a) { storage.set('currentAdmin', a); }
  function clearCurrentAdmin() { storage.remove('currentAdmin'); }

  function registerAdmin(email, password) {
    const admins = getAdmins();
    if (!validateEmail(email)) throw new Error('Invalid email format');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    if (admins.find(a => a.email === email)) throw new Error('Admin already exists');
    admins.push({ id: Date.now(), email, password: btoa(password), createdAt: new Date().toISOString() });
    setAdmins(admins);
    return true;
  }

  function loginAdmin(email, password) {
    const admin = getAdmins().find(a => a.email === email);
    if (!admin || atob(admin.password) !== password) throw new Error('Invalid admin credentials');
    setCurrentAdmin({ id: admin.id, email: admin.email });
    return admin;
  }

  /* ---------- Bikes management ---------- */
  function getBikes() { return storage.get('bikes', []); }
  function setBikes(list) { storage.set('bikes', list); }

  function addBike(bike) {
    const bikes = getBikes();
    if (!bike.name || !bike.type) throw new Error('Bike name and type required');
    if (bike.price < 0) throw new Error('Invalid price');
    bike.id = nextId(bikes);
    bike.createdAt = new Date().toISOString();
    bikes.push(bike);
    setBikes(bikes);
    localStorage.setItem('bikes_update_ts', Date.now());
    return bike;
  }

  function updateBike(updated) {
    const bikes = getBikes();
    const idx = bikes.findIndex(b => b.id === updated.id);
    if (idx === -1) throw new Error('Bike not found');
    bikes[idx] = { ...bikes[idx], ...updated, updatedAt: new Date().toISOString() };
    setBikes(bikes);
    localStorage.setItem('bikes_update_ts', Date.now());
  }

  function removeBike(id) {
    let bikes = getBikes();
    bikes = bikes.filter(b => b.id !== id);
    setBikes(bikes);
    localStorage.setItem('bikes_update_ts', Date.now());
  }

  /* ---------- Rentals & Transactions ---------- */
  function getRentals() { return storage.get('rentals', []); }
  function saveRental(r) {
    const rentals = getRentals();
    r.id = 'RNT' + Date.now();
    r.createdAt = new Date().toISOString();
    rentals.push(r);
    storage.set('rentals', rentals);
    localStorage.setItem('rentals_update_ts', Date.now());
    return r;
  }

  function saveTransaction(tx) {
    const txs = storage.get('transactions', []);
    tx.createdAt = new Date().toISOString();
    txs.push(tx);
    storage.set('transactions', txs);
  }

  function processMobilePayment(provider, mobile, pin, amount, userEmail) {
    return new Promise((resolve, reject) => {
      if (!provider || !mobile || !pin) return reject(new Error('Missing payment details'));
      if (!/^\d{4,6}$/.test(pin)) return reject(new Error('Invalid PIN format'));

      setTimeout(() => {
        if (pin === '0000') return reject(new Error('❌ Invalid PIN. Please try again.'));

        const tx = {
          id: 'TXN' + Math.floor(Math.random() * 900000 + 100000),
          provider,
          mobile: mobile.replace(/\s/g, ''),
          amount,
          userEmail,
          status: 'success',
          timestamp: new Date().toISOString()
        };
        saveTransaction(tx);
        resolve(tx);
      }, 1200);
    });
  }

  /* ---------- Messages/Contact ---------- */
  function getMessages() { return storage.get('messages', []); }
  function saveMessage(msg) {
    const messages = getMessages();
    msg.id = Date.now();
    msg.status = 'pending';
    msg.createdAt = new Date().toISOString();
    messages.unshift(msg);
    storage.set('messages', messages);
    localStorage.setItem('messages_update_ts', Date.now());
    return msg;
  }

  function replyToMessage(msgId, response) {
    const messages = getMessages();
    const idx = messages.findIndex(m => m.id === msgId);
    if (idx === -1) return false;
    messages[idx].response = response;
    messages[idx].status = 'replied';
    messages[idx].repliedAt = new Date().toISOString();
    storage.set('messages', messages);
    localStorage.setItem('messages_update_ts', Date.now());
    return true;
  }

  /* ---------- UI helpers ---------- */
  function showNotificationBar(msg, type = 'success', timeout = 2500) {
    const bar = q('notificationBar');
    if (!bar) return;
    bar.textContent = msg;
    bar.style.display = 'block';
    bar.className = 'notification-bar ' + type;
    setTimeout(() => bar.style.display = 'none', timeout);
  }

  /* ---------- Profile photo upload ---------- */
  function wireProfilePhotoUpload() {
    const input = q('profilePhotoInput');
    if (!input) return;
    input.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 100* 1024 * 1024) { showNotificationBar('❌ File too large (max 5MB)', 'error'); return; }
      if (!file.type.startsWith('image/')) { showNotificationBar('❌ Please upload an image file', 'error'); return; }

      const reader = new FileReader();
      reader.onload = function (ev) {
        const dataUrl = ev.target.result;
        const user = getCurrentUser();
        if (!user) return showNotificationBar('❌ Please login first', 'error');
        user.profilePhoto = dataUrl;
        setCurrentUser(user);
        updateUserInList({ ...user, profilePhoto: dataUrl });
        const photoEl = q('profilePhoto');
        if (photoEl) photoEl.src = dataUrl;
        showNotificationBar('✅ Profile photo updated successfully', 'success');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  /* ---------- Admin page ---------- */
  function wireAdminPage() {
    const adminRegisterForm = q('adminRegisterForm');
    const adminLoginForm = q('adminLoginForm');

    if (adminRegisterForm) {
      adminRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const email = q('regEmail').value.trim();
          const pw = q('regPassword').value;
          registerAdmin(email, pw);
          q('registerMessage').style.color = '#10b981';
          q('registerMessage').textContent = '✅ Admin created! Please login.';
          setTimeout(() => { q('registerMessage').textContent = ''; }, 2000);
          adminRegisterForm.reset();
        } catch (err) {
          q('registerMessage').style.color = '#ef4444';
          q('registerMessage').textContent = '❌ ' + err.message;
        }
      });
    }

    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const email = q('loginEmail').value.trim();
          const pw = q('loginPassword').value;
          loginAdmin(email, pw);
          showAdminDashboard();
          showNotificationBar('✅ Admin login successful', 'success');
        } catch (err) {
          if (q('loginMessage')) q('loginMessage').textContent = '❌ ' + err.message;
        }
      });
    }

    const addBikeForm = q('addBikeForm');
    if (addBikeForm) {
      const fileInput = q('bikeImageFile');
      const hiddenImage = q('bikeImage');
      const preview = q('bikeImagePreview');

      if (fileInput && preview && hiddenImage) {
        fileInput.addEventListener('change', (ev) => {
          const file = ev.target.files && ev.target.files[0];
          if (!file) { preview.innerHTML = ''; hiddenImage.value = ''; return; }
          const reader = new FileReader();
          reader.onload = function (fe) {
            hiddenImage.value = fe.target.result;
            preview.innerHTML = `<img src="${fe.target.result}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">`;
          };
          reader.readAsDataURL(file);
        });
      }

      addBikeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const name = q('bikeName').value.trim();
          const type = q('bikeType').value.trim();
          const price = Number(q('bikePrice').value) || 0;
          const description = q('bikeDescription') ? q('bikeDescription').value.trim() : '';
          const imageData = q('bikeImage').value || 'images/placeholder.png';
          const available = q('bikeAvail').value === 'true';
          addBike({ name, type, price, description, image: imageData, available });
          showNotificationBar('✅ Bike added successfully', 'success');
          addBikeForm.reset();
          if (preview) preview.innerHTML = '';
          loadAdminTables();
        } catch (err) {
          showNotificationBar('❌ ' + err.message, 'error');
        }
      });
    }

    document.addEventListener('click', (ev) => {
      const el = ev.target;
      if (el.matches('[data-action="delete-user"]')) {
        const email = el.dataset.email;
        if (!confirm('Delete user and their rentals?')) return;
        let users = storage.get('users', []);
        users = users.filter(u => u.email !== email);
        storage.set('users', users);
        let rentals = storage.get('rentals', []);
        rentals = rentals.filter(r => r.userEmail !== email);
        storage.set('rentals', rentals);
        showNotificationBar('✅ User deleted', 'success');
        loadAdminTables();
      }
      if (el.matches('[data-action="delete-bike"]')) {
        const id = Number(el.dataset.id);
        if (!confirm('Delete bike?')) return;
        removeBike(id);
        showNotificationBar('✅ Bike deleted', 'success');
        loadAdminTables();
      }
      if (el.matches('[data-action="toggle-bike"]')) {
        const id = Number(el.dataset.id);
        const bikes = getBikes();
        const b = bikes.find(x => x.id === id);
        if (!b) return;
        b.available = !b.available;
        updateBike(b);
        showNotificationBar(`✅ Bike marked as ${b.available ? 'available' : 'unavailable'}`, 'success');
        loadAdminTables();
      }
      if (el.matches('[data-action="edit-bike"]')) {
        const id = Number(el.dataset.id);
        const bikes = getBikes();
        const b = bikes.find(x => x.id === id);
        if (!b) return alert('Bike not found');
        const name = prompt('Name:', b.name);
        if (!name) return;
        const type = prompt('Type:', b.type) || b.type;
        const price = parseFloat(prompt('Price/hour (KES):', b.price) || b.price);
        b.name = name;
        b.type = type;
        b.price = price;
        updateBike(b);
        showNotificationBar('✅ Bike updated', 'success');
        loadAdminTables();
      }
    });
  }

  function showAdminAuth() {
    const authArea = q('authArea');
    const dash = q('dashboard');
    if (authArea) authArea.style.display = '';
    if (dash) dash.style.display = 'none';
  }

  function showAdminDashboard() {
    const authArea = q('authArea');
    const dash = q('dashboard');
    if (authArea) authArea.style.display = 'none';
    if (dash) dash.style.display = '';
    loadAdminTables();
  }

  function loadAdminTables() {
    const users = storage.get('users', []);
    const bikes = getBikes();
    const rentals = storage.get('rentals', []);

    const userTbody = document.querySelector('#userTable tbody');
    if (userTbody) {
      userTbody.innerHTML = users.map(u => `
        <tr>
          <td>${escapeHtml(u.fullname || '')}</td>
          <td>${escapeHtml(u.email || '')}</td>
          <td>${escapeHtml(u.phone || '')}</td>
          <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
          <td>
            <button class="btn" data-action="delete-user" data-email="${u.email}">Delete</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="5">No users</td></tr>';
    }

    const bikesTbody = document.querySelector('#bikesTable tbody');
    if (bikesTbody) {
      bikesTbody.innerHTML = bikes.map(b => `
        <tr>
          <td><img src="${b.image}" alt="${escapeHtml(b.name)}" style="width:60px;height:40px;object-fit:cover;border-radius:6px"></td>
          <td>${escapeHtml(b.name)}</td>
          <td>${escapeHtml(b.type)}</td>
          <td>KES ${b.price.toLocaleString()}/hr</td>
          <td><span style="color:${b.available ? '#10b981' : '#ef4444'}">${b.available ? '✓ Available' : '✗ Unavailable'}</span></td>
          <td>
            <button class="btn" data-action="toggle-bike" data-id="${b.id}">Toggle</button>
            <button class="btn" data-action="edit-bike" data-id="${b.id}">Edit</button>
            <button class="btn danger" data-action="delete-bike" data-id="${b.id}">Delete</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="6">No bikes</td></tr>';
    }

    const rentTbody = document.querySelector('#rentalsTable tbody');
    if (rentTbody) {
      rentTbody.innerHTML = rentals.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${escapeHtml(r.userName || '')}</td>
          <td>${escapeHtml(r.bikeName || '')}</td>
          <td>${r.hours || '1'} hour(s)</td>
          <td>${r.startDate}</td>
          <td>${r.paid ? '✓ Paid' : '✗ Pending'}</td>
        </tr>
      `).join('') || '<tr><td colspan="6">No rentals</td></tr>';
    }
  }

  /* ---------- Rent page ---------- */
  function wireRentPage() {
    const bikesListEl = q('bikesList');
    const rentalDetailsEl = q('rentalDetails');
    const checkoutFormEl = q('checkoutForm');
    if (!bikesListEl) return;

    function renderBikes() {
      const bikes = getBikes();
      bikesListEl.innerHTML = bikes.map(b => `
        <div class="bike-card" data-id="${b.id}" style="border:${b.available ? '' : '2px dashed #cbd5e1'}">
          <div class="bike-image"><img src="${b.image}" alt="${escapeHtml(b.name)}" /></div>
          <div class="bike-info">
            <h3>${escapeHtml(b.name)}</h3>
            <p class="small">${escapeHtml(b.type)}</p>
            <p class="small" style="color:#64748b">${escapeHtml(b.description || '')}</p>
            <div class="bike-price">KES ${b.price.toLocaleString()}/hour</div>
            <button class="btn rent-btn" data-id="${b.id}" ${b.available ? '' : 'disabled'} style="width:100%">${b.available ? '🚴 Rent Now' : '❌ Unavailable'}</button>
          </div>
        </div>
      `).join('');
      bikesListEl.querySelectorAll('.rent-btn').forEach(btn => btn.addEventListener('click', onRentClick));
    }

    function onRentClick(e) {
      const id = Number(e.currentTarget.dataset.id);
      const bike = getBikes().find(x => x.id === id);
      if (!bike) return showNotificationBar('❌ Bike not found', 'error');
      const currentUser = getCurrentUser();
      if (!currentUser) {
        showNotificationBar('❌ Please login to rent', 'error');
        setTimeout(() => window.location.href = 'login.html', 800);
        return;
      }

      if (rentalDetailsEl) {
        rentalDetailsEl.innerHTML = `
          <div style="display:flex;gap:14px;align-items:center;padding:16px;background:#f8fafc;border-radius:10px">
            <img src="${bike.image}" alt="${escapeHtml(bike.name)}" style="width:120px;height:100px;object-fit:cover;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
            <div>
              <h3 style="margin:0 0 4px 0">${escapeHtml(bike.name)}</h3>
              <p class="small" style="margin:0 0 8px 0">${escapeHtml(bike.type)} • ${escapeHtml(bike.description || '')}</p>
              <p style="margin:0"><strong>💰 Price:</strong> KES ${bike.price.toLocaleString()} / hour</p>
            </div>
          </div>
        `;
      }

      if (checkoutFormEl) {
        checkoutFormEl.innerHTML = `
          <form id="rentForm">
            <div class="form-group">
              <label>👤 Renter</label>
              <input type="text" value="${escapeHtml(currentUser.fullname)}" readonly>
            </div>
            <div class="form-group">
              <label>⏰ Rental Hours</label>
              <input type="number" id="rentHours" value="1" min="1" max="24" required onchange="updateRentalTotal()">
            </div>
            <div class="form-group">
              <label>🏷️ Registration Number</label>
              <input type="text" id="regNumber" placeholder="000-000-000/0000" required>
            </div>
            <div style="background:#f0f9ff;padding:12px;border-radius:6px;margin-bottom:14px">
              <p style="margin:0">Total: <strong>KES <span id="rentalTotal">${bike.price.toLocaleString()}</span></strong></p>
            </div>
            <div class="form-group">
              <label>📞 Mobile Provider</label>
              <select id="rentProvider" required>
                <option value="">Select Provider</option>
                <option> safaricom</option>
                <option> Airtel</option>
                <option> T-Kash</option>
              </select>
            </div>
            <div class="form-group">
              <label>📱 Mobile Number</label>
              <input id="rentMobile" type="tel" placeholder="0712345678" pattern="^[0-9]{10}$" required>
            </div>
            <div class="form-group">
              <label>🔒 Mobile PIN</label>
              <input id="rentPin" type="password" maxlength="6" placeholder="Your PIN" pattern="^[0-9]{4,6}$" required>
            </div>
            <button class="btn btn-primary" type="submit" style="width:100%">✅ Confirm & Pay</button>
            <div id="rentMessage" style="margin-top:10px;padding:10px;border-radius:6px;display:none;"></div>
          </form>
        `;

        window.updateRentalTotal = () => {
          const hours = Number(q('rentHours').value) || 1;
          const total = bike.price * hours;
          q('rentalTotal').textContent = total.toLocaleString();
        };

        const formEl = q('rentForm');
        if (!formEl) return;
        formEl.addEventListener('submit', (ev) => {
          ev.preventDefault();
          const hours = Number(q('rentHours').value) || 1;
          const provider = q('rentProvider').value;
          const mobile = q('rentMobile').value.trim();
          const pin = q('rentPin').value.trim();
          const regNumber = q('regNumber').value.trim();
          const rentMessage = q('rentMessage');

          const regNumberNorm = (regNumber || '').toUpperCase();
          const regRegex = /^[A-Z]{3}-\d{3}-\d{3}\/\d{4}$/;
          if (!regNumber || !regRegex.test(regNumberNorm)) {
            rentMessage.style.display = 'block';
            rentMessage.style.background = '#fee2e2';
            rentMessage.style.color = '#991b1b';
            rentMessage.textContent = '❌ Registration number must match format e.g. ENG-219-036/2025';
            return;
          }

          if (!provider) {
            rentMessage.style.display = 'block';
            rentMessage.style.background = '#fee2e2';
            rentMessage.style.color = '#991b1b';
            rentMessage.textContent = '❌ Please select a provider';
            return;
          }

          if (!/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
            rentMessage.style.display = 'block';
            rentMessage.style.background = '#fee2e2';
            rentMessage.style.color = '#991b1b';
            rentMessage.textContent = '❌ Invalid mobile number';
            return;
          }

          if (!/^\d{4,6}$/.test(pin)) {
            rentMessage.style.display = 'block';
            rentMessage.style.background = '#fee2e2';
            rentMessage.style.color = '#991b1b';
            rentMessage.textContent = '❌ PIN must be 4-6 digits';
            return;
          }

          const amount = bike.price * hours;
          rentMessage.style.display = 'block';
          rentMessage.style.background = '#0766e1ff';
          rentMessage.style.color = '#1e40af';
          rentMessage.textContent = '⏳ Processing payment...';

          processMobilePayment(provider, mobile, pin, amount, getCurrentUser().email)
            .then(tx => {
              const startDate = new Date();
              const endDate = new Date(startDate.getTime() + hours * 3600000);
              const rental = saveRental({
                userName: getCurrentUser().fullname,
                userEmail: getCurrentUser().email,
                regNumber: regNumberNorm,
                bikeId: bike.id,
                bikeName: bike.name,
                hours,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                provider,
                mobile,
                paid: true,
                transactionId: tx.id
              });

              const bikes = getBikes();
              const idx = bikes.findIndex(b => b.id === bike.id);
              if (idx > -1) { bikes[idx].available = false; setBikes(bikes); }

              const user = getCurrentUser();
              user.rentals = (user.rentals || 0) + 1;
              setCurrentUser(user);
              updateUserInList({ ...user, rentals: user.rentals });

              rentMessage.style.background = '#dcfce7';
              rentMessage.style.color = '#470fcbff';
              rentMessage.innerHTML = `✅ Payment successful!<br>Tx: <strong>${tx.id}</strong><br>Rental: <strong>${rental.id}</strong><br>Duration: <strong>${hours} hour(s)</strong>`;
              renderBikes();

              setTimeout(() => window.location.href = 'index.html', 3000);
            })
            .catch(err => {
              rentMessage.style.background = '#fee2e2';
              rentMessage.style.color = '#991b1b';
              rentMessage.textContent = '❌ ' + (err.message || 'Payment failed');
            });
        });
      }
    }

    renderBikes();
    window.addEventListener('storage', (ev) => {
      if (ev.key === 'bikes' || ev.key === 'bikes_update_ts' || ev.key === 'rentals_update_ts') renderBikes();
    });
  }

  /* ---------- Auth forms ---------- */
  function wireAuthForms() {
    const signupForm = q('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const fullname = q('signupName').value.trim();
          const email = q('signupEmail').value.trim();
          const pw = q('signupPassword').value;
          const phone = q('signupPhone') ? q('signupPhone').value.trim() : '';
          signupUser({ fullname, email, password: pw, phone });
          showNotificationBar('✅ Account created! Redirecting...', 'success');
          setTimeout(() => window.location.href = 'index.html', 1500);
        } catch (err) {
          showNotificationBar('❌ ' + err.message, 'error', 3500);
        }
      });
    }

    const loginForm = q('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const email = q('loginEmail').value.trim();
          const pw = q('loginPassword').value;
          loginUser({ email, password: pw });
          updateUserUIIndex();
          showNotificationBar('✅ Login successful!', 'success');
          setTimeout(() => window.location.href = 'index.html', 800);
        } catch (err) {
          showNotificationBar('❌ ' + err.message, 'error', 3500);
        }
      });
    }
  }

  /* ---------- Index page ---------- */
  function updateUserUIIndex() {
    const user = getCurrentUser();
    const userDisplay = q('userDisplay');
    const logoutBtn = q('logoutBtn');
    const rentNav = q('rentNav');
    const profileSection = q('profileSection');
    if (!userDisplay || !logoutBtn || !rentNav || !profileSection) return;

    if (user) {
      userDisplay.textContent = `👋 Welcome, ${escapeHtml(user.fullname || user.email)}!`;
      logoutBtn.style.display = 'inline-block';
      rentNav.style.display = 'inline-block';
      profileSection.style.display = 'block';
      const photoEl = q('profilePhoto');
      const detailsEl = q('profileDetails');
      if (photoEl) photoEl.src = user.profilePhoto || 'mesh.jpeg';
      if (detailsEl) {
        detailsEl.innerHTML = `
          <strong>${escapeHtml(user.fullname || 'User')}</strong>
          <div style="color:#64748b;font-size:0.9rem;margin:4px 0">
            📧 ${escapeHtml(user.email)}<br>
            📱 ${escapeHtml(user.phone || 'N/A')}
          </div>
        `;
      }
    } else {
      userDisplay.textContent = '';
      logoutBtn.style.display = 'none';
      rentNav.style.display = 'none';
      profileSection.style.display = 'none';
    }
  }

  function wireIndexPage() {
    const logoutBtn = q('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearCurrentUser();
        updateUserUIIndex();
        showNotificationBar('✅ Logged out successfully', 'success');
        setTimeout(() => location.href = 'index.html', 600);
      });
    }
    wireProfileControls();
    updateUserUIIndex();
  }

  function wireProfileControls() {
    wireProfilePhotoUpload();
  }

  window.editProfile = function () {
    const u = getCurrentUser();
    if (!u) return showNotificationBar('❌ Please login first', 'error');
    const name = prompt('Edit your name:', u.fullname);
    if (name === null) return;
    const phone = prompt('Edit your phone:', u.phone || '');
    if (phone === null) return;
    if (!name.trim()) return showNotificationBar('❌ Name cannot be empty', 'error');
    if (!validatePhone(phone)) return showNotificationBar('❌ Invalid phone format', 'error');
    u.fullname = name;
    u.phone = phone;
    setCurrentUser(u);
    updateUserInList(u);
    updateUserUIIndex();
    showNotificationBar('✅ Profile updated successfully', 'success');
  };

  window.triggerPhotoUpload = function () {
    const el = q('profilePhotoInput');
    if (el) el.click();
  };

  /* ---------- Initialization ---------- */
  function init() {
    seedIfNeeded();
    wireAuthForms();
    wireIndexPage();
    wireAdminPage();
    wireRentPage();

    if (q('authArea') && q('dashboard')) {
      if (getCurrentAdmin()) showAdminDashboard();
      else showAdminAuth();
    }

    updateUserUIIndex();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.app = {
    getBikes,
    addBike,
    updateBike,
    removeBike,
    getRentals,
    getCurrentUser,
    loginUser,
    signupUser,
    getMessages,
    saveMessage,
    replyToMessage
  };

})();