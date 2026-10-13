/* OrthoCare — doctors page: render cards, search, specialty filter, profile dialog.
   Data below is sample content. With OrthoCare.config.API_BASE set, GET /doctors replaces it. */
(function () {
  'use strict';
  var OC = window.OrthoCare;
  var DOCTORS = [
  {
    "id": "anika",
    "name": "Dr. Anika Sample",
    "specialty": "Joint Replacement",
    "qual": "MS (Orthopaedics): placeholder",
    "exp": "15+ years (sample)",
    "focus": [
      "Hip and knee replacement",
      "Revision surgery",
      "Arthritis care"
    ],
    "languages": "English, Hindi (sample)",
    "bio": "Placeholder profile. Replace with the surgeon's real biography, registration number and qualifications.",
    "photo": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=70"
  },
  {
    "id": "rohan",
    "name": "Dr. Rohan Sample",
    "specialty": "Sports Injury & Arthroscopy",
    "qual": "MS (Orthopaedics), Fellowship: placeholder",
    "exp": "11+ years (sample)",
    "focus": [
      "Ligament injuries",
      "Keyhole (arthroscopic) surgery",
      "Return-to-sport plans"
    ],
    "languages": "English, Marathi (sample)",
    "bio": "Placeholder profile. Replace with the specialist's real biography and training details.",
    "photo": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=70"
  },
  {
    "id": "meera",
    "name": "Dr. Meera Sample",
    "specialty": "Spine Care",
    "qual": "MS (Orthopaedics), Spine Fellowship: placeholder",
    "exp": "13+ years (sample)",
    "focus": [
      "Back and neck pain",
      "Disc problems",
      "Posture and mobility"
    ],
    "languages": "English, Hindi (sample)",
    "bio": "Placeholder profile. Replace with the spine specialist's real biography and qualifications.",
    "photo": "https://images.unsplash.com/photo-1594824476967?auto=format&fit=crop&w=500&q=70"
  },
  {
    "id": "kabir",
    "name": "Dr. Kabir Sample",
    "specialty": "Trauma & Fracture",
    "qual": "MS (Orthopaedics): placeholder",
    "exp": "9+ years (sample)",
    "focus": [
      "Fracture management",
      "Casting and splinting",
      "Trauma follow-up"
    ],
    "languages": "English, Hindi (sample)",
    "bio": "Placeholder profile. Replace with the trauma specialist's real biography and qualifications.",
    "photo": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=70"
  },
  {
    "id": "isha",
    "name": "Dr. Isha Sample",
    "specialty": "Rehabilitation",
    "qual": "MPT (Physiotherapy): placeholder",
    "exp": "8+ years (sample)",
    "focus": [
      "Post-surgery rehabilitation",
      "Strength and balance",
      "Pain management"
    ],
    "languages": "English, Hindi (sample)",
    "bio": "Placeholder profile. Replace with the physiotherapist's real biography and qualifications.",
    "photo": "https://images.unsplash.com/photo-1594824476967?auto=format&fit=crop&w=500&q=70"
  },
  {
    "id": "vikram",
    "name": "Dr. Vikram Sample",
    "specialty": "Hip & Knee Care",
    "qual": "MS (Orthopaedics): placeholder",
    "exp": "12+ years (sample)",
    "focus": [
      "Knee pain",
      "Hip pain",
      "Non-surgical treatment plans"
    ],
    "languages": "English, Gujarati (sample)",
    "bio": "Placeholder profile. Replace with the specialist's real biography and qualifications.",
    "photo": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=70"
  }
];

  var grid = document.getElementById('doc-grid');
  var count = document.getElementById('doc-count');
  var search = document.getElementById('doc-search');
  var specialty = document.getElementById('doc-specialty');
  var dialog = document.getElementById('doc-dialog');
  var all = DOCTORS;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function card(d) {
    var art = el('article', 'doc-card card-hover');
    var portrait = el('div', 'portrait');
    var img = document.createElement('img');
    img.src = d.photo; img.loading = 'lazy'; img.width = 116; img.height = 116;
    img.alt = 'Portrait of ' + d.name + ' (stock photo placeholder)';
    portrait.appendChild(img);
    var meta = el('p', 'meta', d.qual);
    meta.appendChild(document.createElement('br'));
    meta.appendChild(document.createTextNode(d.exp));
    var actions = el('div', 'doc-actions');
    var view = el('button', 'btn btn--ghost btn--sm', 'View Profile');
    view.type = 'button';
    view.addEventListener('click', function () { openProfile(d); });
    var book = el('a', 'btn btn--primary btn--sm', 'Book Appointment');
    book.href = 'appointment.html?doctor=' + encodeURIComponent(d.id);
    actions.append(view, book);
    art.append(portrait, el('h3', '', d.name), el('p', 'role', d.specialty), meta, el('span', 'tag', 'Sample profile'), actions);
    return art;
  }

  function render(list) {
    grid.replaceChildren();
    if (!list.length) {
      var empty = el('div', 'empty-state');
      var ic = el('i', 'fa-solid fa-user-doctor'); ic.setAttribute('aria-hidden', 'true');
      empty.append(ic, el('p', '', 'No doctors match your search. Clear the search or choose another specialty.'));
      grid.appendChild(empty);
    } else {
      list.forEach(function (d, i) {
        var c = card(d);
        grid.appendChild(c);
      });
    }
    count.textContent = list.length + (list.length === 1 ? ' doctor' : ' doctors') + ' shown';
  }

  function apply() {
    var q = search.value.trim().toLowerCase();
    var s = specialty.value;
    render(all.filter(function (d) {
      var hay = (d.name + ' ' + d.specialty + ' ' + (d.focus || []).join(' ')).toLowerCase();
      return (!q || hay.indexOf(q) !== -1) && (!s || d.specialty === s);
    }));
  }

  function openProfile(d) {
    document.getElementById('dlg-photo').src = d.photo;
    document.getElementById('dlg-photo').alt = 'Portrait of ' + d.name + ' (stock photo placeholder)';
    document.getElementById('dlg-name').textContent = d.name;
    document.getElementById('dlg-role').textContent = d.specialty;
    document.getElementById('dlg-bio').textContent = d.bio;
    document.getElementById('dlg-book').href = 'appointment.html?doctor=' + encodeURIComponent(d.id);
    var dl = document.getElementById('dlg-list');
    dl.replaceChildren();
    [['Qualifications', d.qual], ['Experience', d.exp], ['Focus areas', (d.focus || []).join(', ')], ['Languages', d.languages]].forEach(function (row) {
      dl.append(el('dt', '', row[0]), el('dd', '', row[1]));
    });
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  document.getElementById('dlg-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  search.addEventListener('input', apply);
  specialty.addEventListener('change', apply);
  document.getElementById('doc-reset').addEventListener('click', function () {
    search.value = ''; specialty.value = ''; apply(); search.focus();
    OC.toast('Filters cleared.');
  });

  var start = OC.api.enabled()
    ? OC.api.get('/doctors').then(function (list) { return Array.isArray(list) && list.length ? list : DOCTORS; }).catch(function () { return DOCTORS; })
    : Promise.resolve(DOCTORS);
  start.then(function (list) { all = list; apply(); });
})();
