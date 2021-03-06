const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/approval/utils/error_message');
const __ = require('locale/client/approval.lang.json');

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';
  config.fields[1].text = '(' + obj.loadbalancer.vip_subnet_id.slice(0, 8) + ')';
  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getRelated(false).then(res => {
        //instance should be in the same subnet with pool related lb
        let subnetID = obj.loadbalancer.vip_subnet_id;
        let instanceData = res.instance.filter(ins => {
          for(let s in ins.addresses) {
            if(ins.addresses[s].length > 0) {
              let underSubnet = ins.addresses[s].some(addr => {
                if(addr.subnet && addr.subnet.id === subnetID) {
                  return true;
                }
                return false;
              });

              if(underSubnet) {
                return true;
              }
            }
          }
          return false;
        });

        refs.instance.setState({
          ports: res.port,
          data: instanceData,
          value: instanceData[0] ? instanceData[0].id : ''
        });
      });
      refs.weight.setState({
        value: 1
      });
    },
    onConfirm: function(refs, cb) {
      let memberParam = {
        'address': refs.ip_address.state.value,
        'protocol_port': refs.protocol_port.state.value,
        'weight': refs.weight.state.value,
        'subnet_id': obj.loadbalancer.vip_subnet_id
      };
      request.addMember(obj.id, memberParam).then(res => {
        callback && callback();
        cb(true);
      }).catch(error => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      let protocolPort = refs.protocol_port.state.value,
        fullFilled = refs.instance.state.value && refs.ip_address.state.value && protocolPort && !refs.protocol_port.state.error && !refs.weight.state.error;
      switch(field) {
        case 'instance':
          let servers = refs.instance.state.data,
            ports = refs.instance.state.ports;
          servers.some(ele => {
            if(ele.id === refs.instance.state.value) {
              ports.some(p => {
                if(ele.fixed_ips && ele.fixed_ips[0] === p.fixed_ips[0].ip_address) {
                  let portData = [{
                    name: ele.fixed_ips[0] + '/' + (p.name || '(' + p.id.slice(0, 8) + ')'),
                    id: ele.fixed_ips[0]
                  }];
                  refs.ip_address.setState({
                    data: portData,
                    value: portData[0].id
                  });
                }
              });
            }
          });
          break;
        case 'protocol_port':
          if(protocolPort > 0 && protocolPort < 65536) {
            refs.protocol_port.setState({
              error: false
            });
          } else {
            refs.protocol_port.setState({
              error: true
            });
          }
          break;
        case 'weight':
          let weight = refs.weight.state.value;
          if(weight > 0 && weight < 101) {
            refs.weight.setState({
              error: false
            });
          } else {
            refs.weight.setState({
              error: true
            });
          }
          break;
        default:
          break;
      }
      if(fullFilled) {
        refs.btn.setState({
          disabled: false
        });
      } else {
        refs.btn.setState({
          disabled: true
        });
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
