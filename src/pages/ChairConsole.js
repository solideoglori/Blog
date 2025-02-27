import _ from 'lodash';
import { Component, Fragment } from 'react';
import { button, div, h, hh, hr, span } from 'react-hyperscript-helpers';
import { PageHeading } from '../components/PageHeading';
import { PageSubHeading } from '../components/PageSubHeading';
import { PaginatorBar } from '../components/PaginatorBar';
import { SearchBox } from '../components/SearchBox';
import { PendingCases } from '../libs/ajax';
import { Storage } from '../libs/storage';
import { NavigationUtils, USER_ROLES } from '../libs/utils';

export const ChairConsole = hh(class ChairConsole extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      currentUser: {},
      dulLimit: 5,
      darLimit: 5,
      currentDulPage: 1,
      currentDarPage: 1,
      totalDulPendingVotes: 0,
      totalAccessPendingVotes: 0,
      electionsList: {
        dul: [],
        access: []
      }
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }


  handleDulPageChange = page => {
    this.setState(prev => {
      prev.currentDulPage = page;
      return prev;
    });
  };

  handleAccessPageChange = page => {
    this.setState(prev => {
      prev.currentDarPage = page;
      return prev;
    });
  };

  handleDulSizeChange = size => {
    this.setState(prev => {
      prev.dulLimit = size;
      prev.currentDulPage = 1;
      return prev;
    });
  };

  handleAccessSizeChange = size => {
    this.setState(prev => {
      prev.darLimit = size;
      prev.currentDarPage = 1;
      return prev;
    });
  };

  componentDidMount() {
    let currentUser = Storage.getCurrentUser();
    this.setState({
      currentUser: currentUser
    }, () => {
      this.init(currentUser);
    });
  }

  init(currentUser) {

    PendingCases.findConsentPendingCasesByUser(currentUser.dacUserId).then(
      duls => {
        this.setState(prev => {
          prev.electionsList.dul = duls.dul;
          prev.totalDulPendingVotes = duls.totalDulPendingVotes;
          return prev;
        });
      }
    );

    PendingCases.findDataRequestPendingCasesByUser(currentUser.dacUserId).then(
      dars => {
        this.setState(prev => {
          // Filter vote-able elections. See https://broadinstitute.atlassian.net/browse/DUOS-789
          // for more work related to ensuring closed elections aren't displayed here.
          prev.electionsList.access = _.filter(dars.access, (e) => { return e.electionStatus !== 'Closed'; });
          prev.totalAccessPendingVotes = dars.totalAccessPendingVotes;
          return prev;
        });
      }
    );
  }

  openDULReview = (voteId, referenceId) => (e) => {
    this.props.history.push(`dul_review/${voteId}/${referenceId}`);
  };

  isDuLCollectEnabled = (pendingCase) => {
    const pendingCaseDulCollectStatus = (pendingCase.alreadyVoted === true);
    const dacId = _.get(pendingCase, 'dac.dacId', 0);
    // if the pending case doesn't have a DAC, then any chair should be able to collect votes:
    if (dacId === 0) { return pendingCaseDulCollectStatus; }
    const dacChairRoles = _.filter(this.state.currentUser.roles, { 'name': USER_ROLES.chairperson, 'dacId': dacId });
    return (!_.isEmpty(dacChairRoles)) && pendingCaseDulCollectStatus;
  };

  openDulCollect = (consentId) => (e) => {
    this.props.history.push(`dul_collect/${consentId}`);
  };

  openFinalAccessReview = (referenceId, electionId, rpElectionId) => (e) => {
    this.props.history.push(`${'final_access_review'}/${referenceId}/${electionId}`);
  };

  openAccessReview = (referenceId, voteId, rpVoteId, alreadyVoted) => async (e) => {
    const pathStart = await NavigationUtils.accessReviewPath();
    let chairFinal = false;
    if(this.state.currentUser && alreadyVoted) {
      chairFinal = this.state.currentUser.isChairPerson;
    }
    if (rpVoteId !== null) {
      this.props.history.push(
        `${pathStart}/${referenceId}/${voteId}/${rpVoteId}`,
        {chairFinal}
      );
    } else {
      this.props.history.push(
        `${pathStart}/${referenceId}/${voteId}`,
        {chairFinal}
      );
    }
  };

  isAccessCollectEnabled = (pendingCase) => {
    const pendingCaseAccessCollectStatus =
      (pendingCase.alreadyVoted === true) &&
      (!pendingCase.isFinalVote) &&
      (pendingCase.electionStatus !== 'Final');
    const dacId = _.get(pendingCase, 'dac.dacId', 0);
    // if the pending case doesn't have a DAC, then any chair should be able to collect votes:
    if (dacId === 0) { return pendingCaseAccessCollectStatus; }
    const dacChairRoles = _.filter(this.state.currentUser.roles, { 'name': USER_ROLES.chairperson, 'dacId': dacId });
    return (!_.isEmpty(dacChairRoles)) && pendingCaseAccessCollectStatus;
  };

  openAccessCollect = (referenceId, electionId) => (e) => {
    this.props.history.push(`access_collect/${electionId}/${referenceId}`);
  };


  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  handleSearchDul = (query) => {
    this.setState({ searchDulText: query });
  };

  handleSearchDar = (query) => {
    this.setState({ searchDarText: query });
  };

  searchTable = (query) => (row) => {
    if (query) {
      let text = JSON.stringify(row);
      return text.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  };

  render() {

    const { currentUser, dulLimit, darLimit, searchDulText, searchDarText } = this.state;
    const oneColumnClass = 'col-lg-1 col-md-1 col-sm-1 col-xs-1';
    const twoColumnClass = 'col-lg-2 col-md-2 col-sm-2 col-xs-2';
    const threeColumnClass = 'col-lg-3 col-md-3 col-sm-3 col-xs-3';

    return (

      div({ className: 'container' }, [
        div({ className: 'col-lg-10 col-lg-offset-1 col-md-10 col-md-offset-1 col-sm-12 col-xs-12' }, [
          PageHeading({
            id: 'chairConsole', color: 'common', title: 'Welcome to your DAC Chair Console, ' + currentUser.displayName + '!',
            description: 'These are your pending cases for review'
          }),

          hr({ className: 'section-separator' }),

          div({ className: 'row no-margin' }, [
            div({ className: 'col-lg-8 col-md-8 col-sm-8 col-xs-12 no-padding' }, [
              PageSubHeading({
                id: 'chairConsoleDul', imgSrc: '/images/icon_dul.png', color: 'dul', title: 'Data Use Limitations Review',
                description: 'Were data use limitations accurately converted to a structured format?'
              })
            ]),
            div({ className: 'col-lg-4 col-md-4 col-sm-4 col-xs-12 search-wrapper no-padding' }, [
              h(SearchBox, { id: 'chairConsoleDul', searchHandler: this.handleSearchDul, pageHandler: this.handleDulPageChange, color: 'dul' })
            ])
          ]),

          div({ className: 'jumbotron table-box' }, [
            div({ className: 'row no-margin' }, [
              div({ className: twoColumnClass + 'cell-header dul-color' }, ['Consent id']),
              div({ className: threeColumnClass + ' cell-header dul-color' }, ['Consent Group Name']),
              div({ className: twoColumnClass + ' cell-header dul-color' }, ['DAC']),
              div({ className: twoColumnClass + ' cell-header f-center dul-color' }, [
                'Review/Vote',
                div({ isRendered: this.state.totalDulPendingVotes > 0, id: 'dulPendingVoteCases', className: 'pcases-small-tag' }, [
                  this.state.totalDulPendingVotes
                ])
              ]),
              div({ className: oneColumnClass + ' cell-header f-center dul-color' }, ['Logged']),
              div({ className: twoColumnClass + ' cell-header f-center dul-color' }, ['Actions'])
            ]),

            hr({ className: 'table-head-separator' }),

            this.state.electionsList.dul.filter(this.searchTable(searchDulText))
              .slice((this.state.currentDulPage - 1) * dulLimit, this.state.currentDulPage * dulLimit)
              .map((pendingCase, rIndex) => {
                return h(Fragment, { key: rIndex }, [
                  div({ className: 'row no-margin tableRowDul' }, [
                    div({
                      id: pendingCase.frontEndId, name: 'consentId', className: twoColumnClass + ' cell-body text',
                      title: pendingCase.frontEndId
                    }, [pendingCase.frontEndId]),
                    div({
                      id: pendingCase.frontEndId + '_consentGroup', name: 'consentGroup',
                      className: threeColumnClass + ' cell-body text ' + (!pendingCase.consentGroupName ? 'empty' : ''),
                      title: pendingCase.consentGroupName, dangerouslySetInnerHTML: { __html: pendingCase.consentGroupName }
                    }, []),
                    div({
                      id: pendingCase.frontEndId + '_dacName', name: 'dacName', className: twoColumnClass + ' cell-body text',
                      title: _.get(pendingCase, 'dac.name', '')
                    }, [_.get(pendingCase, 'dac.name', '- -')]),
                    div({ className: twoColumnClass + ' cell-body f-center' }, [
                      button({
                        id: pendingCase.frontEndId + '_btnVote',
                        name: 'btn_voteDul',
                        onClick: this.openDULReview(pendingCase.voteId, pendingCase.referenceId),
                        className: 'cell-button ' + (pendingCase.alreadyVoted ? 'default-color' : 'cancel-color')
                      }, [
                        span({ isRendered: pendingCase.alreadyVoted === false }, ['Vote']),
                        span({ isRendered: pendingCase.alreadyVoted === true }, ['Edit'])
                      ])
                    ]),

                    div({
                      id: pendingCase.frontEndId + '_logged', name: 'loggedDul',
                      className: oneColumnClass + ' cell-body text f-center'
                    }, [pendingCase.logged]),

                    div({ isRendered: this.isDuLCollectEnabled(pendingCase), className: twoColumnClass + ' cell-body f-center' }, [
                      button({
                        id: pendingCase.frontEndId + '_btnCollect', name: 'btn_collectDul', onClick: this.openDulCollect(pendingCase.referenceId),
                        className: 'cell-button cancel-color'
                      }, ['Collect Votes'])
                    ]),
                    div({
                      isRendered: pendingCase.alreadyVoted === false, className: twoColumnClass + ' cell-body text empty f-center'
                    }, [])
                  ]),
                  hr({ className: 'table-body-separator' })
                ]);
              }),
            PaginatorBar({
              name: 'dul',
              total: this.state.electionsList.dul.filter(this.searchTable(searchDulText)).length,
              limit: dulLimit,
              currentPage: this.state.currentDulPage,
              onPageChange: this.handleDulPageChange,
              changeHandler: this.handleDulSizeChange
            })
          ]),

          div({ className: 'row no-margin' }, [
            div({ className: 'col-lg-8 col-md-8 col-sm-8 col-xs-12 no-padding' }, [
              PageSubHeading({
                id: 'chairConsoleAccess', imgSrc: '/images/icon_access.png', color: 'access', title: 'Data Access Request Review',
                description: 'Should data access be granted to this applicant?'
              })
            ]),
            div({ className: 'col-lg-4 col-md-4 col-sm-4 col-xs-12 search-wrapper no-padding' }, [
              h(SearchBox,
                { id: 'chairConsoleAccess', searchHandler: this.handleSearchDar, pageHandler: this.handleAccessPageChange, color: 'access' })
            ])
          ]),

          div({ className: 'jumbotron table-box' }, [
            div({ className: 'row no-margin' }, [
              div({ className: twoColumnClass + ' cell-header access-color' }, ['Data Request Id']),
              div({ className: threeColumnClass + ' cell-header access-color' }, ['Project Title']),
              div({ className: twoColumnClass + ' cell-header access-color' }, ['DAC']),
              div({ className: twoColumnClass + ' cell-header f-center access-color' }, [
                'Review/Vote',
                div({ isRendered: this.state.totalAccessPendingVotes > 0, id: 'accessPendingVoteCases', className: 'pcases-small-tag' }, [
                  this.state.totalAccessPendingVotes
                ])
              ]),
              div({ className: oneColumnClass + ' cell-header f-center access-color' }, ['Logged']),
              div({ className: twoColumnClass + ' cell-header f-center access-color' }, [
                'Actions'
              ])
            ]),

            hr({ className: 'table-head-separator' }),

            this.state.electionsList.access.filter(this.searchTable(searchDarText))
              .slice((this.state.currentDarPage - 1) * darLimit, this.state.currentDarPage * darLimit)
              .map((pendingCase, rIndex) => {
                return h(Fragment, { key: rIndex }, [
                  div({ className: 'row no-margin tableRowAccess' }, [
                    div({
                      id: pendingCase.frontEndId, name: 'darId', className: twoColumnClass + ' cell-body text',
                      title: pendingCase.frontEndId
                    }, [pendingCase.frontEndId]),
                    div({
                      id: pendingCase.frontEndId + '_projectTitle', name: 'projectTitle',
                      className: threeColumnClass + ' cell-body text', title: pendingCase.projectTitle
                    }, [pendingCase.projectTitle]),
                    div({
                      id: pendingCase.frontEndId + '_dacName', name: 'dacName', className: twoColumnClass + ' cell-body text',
                      title: _.get(pendingCase, 'dac.name', '')
                    }, [_.get(pendingCase, 'dac.name', '- -')]),
                    div({ isRendered: pendingCase.electionStatus !== 'Final', className: twoColumnClass + ' cell-body f-center' }, [
                      button({
                        id: pendingCase.frontEndId + '_btnVote',
                        name: 'btn_voteAccess',
                        onClick: this.openAccessReview(pendingCase.referenceId, pendingCase.voteId, pendingCase.rpVoteId, pendingCase.alreadyVoted),
                        className: 'cell-button cancel-color'
                      }, [
                        span({ isRendered: (pendingCase.alreadyVoted === false) && (pendingCase.electionStatus !== 'Final') }, ['Vote']),
                        span({ isRendered: pendingCase.alreadyVoted === true }, ['Log Final Vote'])
                      ])
                    ]),
                    div({
                      isRendered: pendingCase.electionStatus === 'Final',
                      className: twoColumnClass + ' cell-body text f-center empty'
                    }, []),

                    div({
                      id: pendingCase.frontEndId + '_logged', name: 'loggedAccess',
                      className: oneColumnClass + ' cell-body text f-center'
                    }, [pendingCase.logged]),

                    div({
                      isRendered: this.isAccessCollectEnabled(pendingCase),
                      className: twoColumnClass + ' cell-body f-center'
                    }, []),
                    div({
                      isRendered: (pendingCase.alreadyVoted === true) && (pendingCase.electionStatus === 'Final'),
                      className: twoColumnClass + ' cell-body f-center'
                    }, []),
                    div({
                      isRendered: (!pendingCase.alreadyVoted) && (pendingCase.electionStatus !== 'Final'),
                      className: twoColumnClass + ' cell-body text f-center empty'
                    }, [])
                  ]),
                  hr({ className: 'table-body-separator' })
                ]);
              }),
            PaginatorBar({
              name: 'access',
              total: this.state.electionsList.access.filter(this.searchTable(searchDarText)).length,
              limit: darLimit,
              currentPage: this.state.currentDarPage,
              onPageChange: this.handleAccessPageChange,
              changeHandler: this.handleAccessSizeChange
            })
          ])
        ])
      ])
    );
  }
});
