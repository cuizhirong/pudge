var fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getFloatingipList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/floatingips?tenant_id=' + HALO.user.projectId
    }).then(function(data) {
      return data.floatingips;
    });
  }
};
