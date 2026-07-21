/* ===== Tire Special & Auto Repair — backend API client ===== */
(function () {
  var API_BASE = window.TS_API_BASE || 'http://localhost:4000';

  function searchTires(params) {
    var url = API_BASE + '/api/tires/search'
      + '?width=' + encodeURIComponent(params.width)
      + '&ratio=' + encodeURIComponent(params.ratio)
      + '&diameter=' + encodeURIComponent(params.diameter);

    return fetch(url).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (body) {
        if (!res.ok) {
          throw new Error((body && body.message) || 'Request failed (' + res.status + ')');
        }
        return body;
      });
    });
  }

  window.tsApi = { searchTires: searchTires };
})();
