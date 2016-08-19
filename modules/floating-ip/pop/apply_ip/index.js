var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var request = require('../../request');
var __ = require('locale/client/approval.lang.json');
var getErrorMessage = require('client/applications/approval/utils/error_message');
// function priceError(refs, error) {
//   refs.btn.setState({
//     disabled: false
//   });
// }
var externalNetwork = null;

function pop(parent, callback) {

  var settings = HALO.settings;
  var enableBandwidth = settings.enable_floatingip_bandwidth;
  // var enableCharge = settings.enable_charge;
  var defaultBandwidth = settings.max_floatingip_bandwidth;

  var tipField = config.fields[0];
  var bandwidthField = config.fields[1];
  var chargeField = config.fields[2];

  if (enableBandwidth) {
    if (defaultBandwidth) {
      bandwidthField.max = defaultBandwidth;
    }
    bandwidthField.hide = false;
    tipField.hide = true;
    // if (enableCharge) {
    //   chargeField.hide = false;
    // }
  } else {
    bandwidthField.hide = true;
    chargeField.hide = true;
    tipField.hide = false;
  }

  var props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      /*if (enableCharge) {
        var bandwidth = config.fields[0].min;
        request.getFloatingIPPrice(bandwidth).then((res) => {
          refs.charge.setState({
            value: res.unit_price
          });

          refs.btn.setState({
            disabled: false
          });
        }).catch(priceError.bind(this, refs));
      }*/

      request.getNetworks().then((networks) => {
        var floatingNetwork = networks.filter((item) => item['router:external']);

        if (floatingNetwork.length > 0) {
          externalNetwork = floatingNetwork;
          if(externalNetwork.length > 1) {
            refs.external_network.setState({
              data: externalNetwork,
              value: externalNetwork[0].id,
              hide: false
            });
          }
        } else {
          refs.warning.setState({
            value: __.create_floatingip_error,
            hide: false
          });

          refs.btn.setState({
            disabled: true
          });
        }
      });

    },
    onConfirm: function(refs, cb) {
      if (externalNetwork) {
      var data = {};
      data.detail = {};
      var createDetail = data.detail;

      createDetail.create = [];
      var configCreate = createDetail.create;
      var createItem = {};
      createItem = {
        _type: 'Floatingip',
        _identity: 'floatingip'
      };
      
        if(externalNetwork.length === 1) {
          createItem.floating_network_id = externalNetwork[0].id;
        } else {
          createItem.floating_network_id = refs.external_network.state.value;
        }

        if (enableBandwidth) {
          let bandwidth = Number(refs.bandwidth.state.value) * 1024;
          createItem.floatingip.rate_limit = bandwidth;
        }

        configCreate.push(createItem);
        data.description = refs.apply_description.state.value;
        request.createFloatingIp(data).then((res) => {
          callback && callback(res.floatingip);
          cb(true);
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, state, refs) {
      switch (field) {
        /*case 'bandwidth':
          if (enableCharge) {
            var sliderEvent = state.eventType === 'mouseup';
            var inputEvnet = state.eventType === 'change' && !state.error;

            if (sliderEvent || inputEvnet) {
              request.getFloatingIPPrice(state.value).then((res) => {
                refs.charge.setState({
                  value: res.unit_price
                });
              }).catch(priceError.bind(this, refs));
            }

            refs.btn.setState({
              disabled: state.error
            });
          }
          break;*/
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
