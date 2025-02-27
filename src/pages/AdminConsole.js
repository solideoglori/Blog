import { Component } from 'react';
import { div, hr } from 'react-hyperscript-helpers';
import { AdminConsoleBox } from '../components/AdminConsoleBox';
import { PageHeading } from '../components/PageHeading';
import { AddDulModal } from '../components/modals/AddDulModal';
import { AddDacModal } from './manage_dac/AddDacModal';
import { AddUserModal } from '../components/modals/AddUserModal';
import { AddDatasetModal } from '../components/modals/AddDatasetModal';
import { ElectionTimeoutModal } from '../components/modals/ElectionTimeoutModal';
import { Election, ElectionTimeout, PendingCases } from '../libs/ajax';
import { Storage } from '../libs/storage';

class AdminConsole extends Component {

  constructor(props) {
    super(props);

    let currentUser = Storage.getCurrentUser();

    this.state = {
      currentUser: currentUser,
      showModal: false,
      showAddDulModal: false,
      showAddDacModal: false,
      showAddUserModal: false,
      showAddDatasetModal: false,
      showElectionTimeoutModal: false,
      dulUnreviewedCases: 0,
      darUnreviewedCases: 0,
      timeOut: {},
      isDataSetElection: {}
    };
    this.electionTimeout = this.electionTimeout.bind(this);
  }

  componentDidMount() {
    let currentUser = Storage.getCurrentUser();
    this.setState({
      currentUser: currentUser
    }, () => {
      this.init();
    });
  }

  async init() {

    PendingCases.findConsentUnReviewed().then(
      duls => {
        this.setState({
          dulUnreviewedCases: duls.dulUnReviewedCases,
        });
      }
    );

    PendingCases.findDARUnReviewed().then(
      dars => {
        this.setState({
          darUnreviewedCases: dars.darUnReviewedCases,
        });
      }
    );
  }

  addDul = (e) => {
    this.setState(prev => {
      prev.showAddDulModal = true;
      return prev;
    });
  };

  addDac = (e) => {
    this.setState(prev => {
      prev.showAddDacModal = true;
      return prev;
    });
  };

  addUser = (e) => {
    this.setState(prev => {
      prev.showAddUserModal = true;
      return prev;
    });
  };

  addDataset = (e) => {
    this.setState(prev => {
      prev.showAddDatasetModal = true;
      return prev;
    });
  };

  async electionTimeout(e) {
    const timeOut = await ElectionTimeout.findApprovalExpirationTime();
    const isDataSetElection = await Election.isDataSetElectionOpen();

    this.setState(prev => {
      prev.showElectionTimeoutModal = true;
      prev.timeOut = timeOut;
      prev.isDataSetElection = isDataSetElection;
      return prev;
    });
  }

  okModal = (name) => {

    switch (name) {
      case 'editDul':
        this.setState({ showAddDulModal: false });
        this.props.history.push(`admin_manage_dul`);
        break;
      case 'addUser':
        this.setState({showAddUserModal: false});
        this.props.history.push(`admin_manage_users`);
        break;
      case 'addDac':
        this.setState({showAddDacModal: false});
        this.props.history.push(`admin_manage_dac`);
        break;
      case 'addDataset': {
        this.setState({ showAddDatasetModal: false });
        this.props.history.push(`dataset_catalog`);
        break;
      }
      case 'electionTimeout': this.setState({ showElectionTimeoutModal: false }); break;
      default: break;
    }
  };

  closeModal = (name) => {
    switch (name) {
      case 'addDul': this.setState({ showAddDulModal: false }); break;
      case 'addDac': this.setState({ showAddDacModal: false }); break;
      case 'addUser': this.setState({ showAddUserModal: false }); break;
      case 'addDataset': this.setState({ showAddDatasetModal: false }); break;
      case 'electionTimeout': this.setState({ showElectionTimeoutModal: false }); break;
      default: break;
    }
  };

  afterModalOpen = (name) => {
    switch (name) {
      case 'addDul': this.setState(prev => { prev.showAddDulModal = false; return prev; }); break;
      case 'addDac': this.setState(prev => { prev.showAddDacModal = false; return prev; }); break;
      case 'addUser': this.setState(prev => { prev.showAddUserModal = false; return prev; }); break;
      case 'addDataset': this.setState(prev => { prev.showAddDatasetModal = false; return prev; }); break;
      case 'electionTimeout': this.setState(prev => { prev.showElectionTimeoutModal = false; return prev; }); break;
      default: break;
    }
  };

  render() {

    const { currentUser, dulUnreviewedCases, darUnreviewedCases } = this.state;

    return (

      div({}, [

        div({ className: "container" }, [
          div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
            PageHeading({ id: "adminConsole", color: "common", title: "Welcome to your Admin Console, " + currentUser.displayName + "!", description: "What would you like to do today?" }),
            hr({ className: "section-separator" })
          ]),

          div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [

            div({ className: "row fsi-row-lg-level fsi-row-md-level no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_manageDUL',
                  url: '/admin_manage_dul',
                  color: 'dul',
                  title: 'Manage Data Use Limitations',
                  description: 'Select and manage Data Use Limitations Record for review',
                  iconName: 'manage-dul',
                  iconSize: 'default',
                  unreviewedCases: dulUnreviewedCases
                }),
              ]),

              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [

                AdminConsoleBox({
                  id: 'btn_addDUL',
                  clickHandler: this.addDul,
                  color: 'dul',
                  title: 'Add Data Use Limitations',
                  description: 'Catalog a Data Use Limitation Record in the system',
                  iconName: 'add-dul',
                  iconSize: 'default',
                }),
                AddDulModal({
                  isRendered: this.state.showAddDulModal,
                  showModal: this.state.showAddDulModal,
                  editMode: false,
                  onOKRequest: this.okModal,
                  onCloseRequest: this.closeModal,
                  onAfterOpen: this.afterModalOpen,
                  dul: '',
                  editConsent: ''
                }),
              ]),
            ]),

            div({ className: "row fsi-row-lg-level fsi-row-md-level no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_manageUsers',
                  url: '/admin_manage_users',
                  color: 'common',
                  title: 'Manage Users',
                  description: 'Select and manage Users and their roles',
                  iconName: 'manage-user',
                  iconSize: 'default',
                }),
              ]),

              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_addUser',
                  clickHandler: this.addUser,
                  color: 'common',
                  title: 'Add User',
                  description: 'Catalog a new User in the system',
                  iconName: 'add-user',
                  iconSize: 'default',
                }),
                AddUserModal({
                  isRendered: this.state.showAddUserModal,
                  showModal: this.state.showAddUserModal,
                  onOKRequest: this.okModal,
                  onCloseRequest: this.closeModal,
                  onAfterOpen: this.afterModalOpen
                }),
              ]),
            ]),

            div({ className: "row fsi-row-lg-level fsi-row-md-level no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_manageDAR',
                  url: '/admin_manage_access',
                  color: 'access',
                  title: 'Manage Data Access Request',
                  description: 'Select and manage Data Access Request for review',
                  iconName: 'manage-access',
                  iconSize: 'default',
                  unreviewedCases: darUnreviewedCases
                }),
              ]),

              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_addDataset',
                  clickHandler: this.addDataset,
                  color: 'dataset',
                  title: 'Add Datasets',
                  description: 'Upload Datasets associated with Data Use Limitations',
                  iconName: 'add-dataset',
                  iconSize: 'large',
                  unreviewedCases: 0
                }),
                AddDatasetModal({
                  showModal: this.state.showAddDatasetModal,
                  onOKRequest: this.okModal,
                  onCloseRequest: this.closeModal,
                  onAfterOpen: this.afterModalOpen
                })
              ])
            ]),

            div({ className: "row fsi-row-lg-level fsi-row-md-level no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_manageDAC',
                  url: '/admin_manage_dac',
                  color: 'common',
                  title: 'Manage Data Access Committee',
                  description: 'Create and manage Data Access Committees',
                  iconName: 'manage-dac',
                  iconSize: 'large',
                })
              ]),

              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_addDAC',
                  clickHandler: this.addDac,
                  color: 'common',
                  title: 'Add Data Access Committee',
                  description: 'Create a new Data Access Committee in the system',
                  iconName: 'add-dac',
                  iconSize: 'large',
                }),
                AddDacModal({
                  showModal: this.state.showAddDacModal,
                  isEditMode: false,
                  onOKRequest: this.okModal,
                  onCloseRequest: this.closeModal,
                  onAfterOpen: this.afterModalOpen
                })
              ])
            ]),

            div({ className: "row fsi-row-lg-level fsi-row-md-level no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_electionTimeout',
                  clickHandler: this.electionTimeout,
                  color: 'common',
                  title: 'Set Data Owner election Timeout',
                  description: 'Manage Data Owner election expiration time',
                  iconName: 'manage-timeout',
                  iconSize: 'large',
                  unreviewedCases: 0
                }),
                ElectionTimeoutModal({
                  timeOut: this.state.timeOut,
                  isDataSetElection: this.state.isDataSetElection,
                  showModal: this.state.showElectionTimeoutModal,
                  onOKRequest: this.okModal,
                  onCloseRequest: this.closeModal,
                  onAfterOpen: this.afterModalOpen
                })
              ]),

              div({ className: "col-lg-6 col-md-6 col-sm-12 col-xs-12 admin-box" }, [
                AdminConsoleBox({
                  id: 'btn_invalidRequest',
                  url: '/invalid_restrictions',
                  color: 'common',
                  title: 'Invalid Request Restrictions',
                  description: 'Show Invalid Restrictions for Data Use Limitations and Data Access Requests',
                  iconName: 'invalid-restrictions',
                  iconSize: 'large',
                  unreviewedCases: 0
                })
              ])
            ])
          ])
        ])
      ])
    );
  }
}

export default AdminConsole;
