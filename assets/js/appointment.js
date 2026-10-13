/* OrthoCare — appointment form: preselect from ?doctor= / ?treatment=, validate, submit. */
(function () {
  'use strict';
  var OC = window.OrthoCare;
  var form = document.getElementById('appointment-form');
  if (!form) return;

  var status = document.getElementById('appointment-status');
  var date = document.getElementById('date');
  date.min = OC.todayStr();
  OC.watchForm(form);

  var params = new URLSearchParams(window.location.search);
  ['doctor', 'treatment'].forEach(function (key) {
    var select = document.getElementById(key);
    var wanted = params.get(key);
    if (wanted && select.querySelector('option[value="' + CSS.escape(wanted) + '"]')) select.value = wanted;
  });

  function describe(d) {
    var doctor = document.getElementById('doctor');
    var treatment = document.getElementById('treatment');
    return d.name + ', ' + treatment.options[treatment.selectedIndex].text + ' with ' + doctor.options[doctor.selectedIndex].text +
      ' on ' + d.date + ' (' + d.time + ')';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    if (!OC.validateForm(form)) {
      OC.setStatus(status, 'err', 'Some details need fixing. Check the highlighted fields and send again.');
      OC.toast('Check the highlighted fields.', 'error');
      return;
    }
    var payload = OC.formData(form);

    if (!OC.api.enabled()) {
      OC.setStatus(status, 'warn', 'Your request is ready: ' + describe(payload) + '. This demo is not connected to a booking service, so no appointment has been booked. Please call the clinic to confirm.');
      OC.toast('Checked. Nothing booked: no backend connected yet.');
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    OC.api.post('/appointments', payload).then(function () {
      OC.setStatus(status, 'ok', 'Request received for ' + describe(payload) + '. The clinic will contact you to confirm the time. It is not a confirmed appointment until they do.');
      OC.toast('Appointment request sent.');
      form.reset();
    }).catch(function (err) {
      OC.setStatus(status, 'err', 'We could not send your request: ' + err.message + ' Please try again or call the clinic.');
      OC.toast('Request not sent.', 'error');
    }).finally(function () { btn.disabled = false; });
  });
})();
