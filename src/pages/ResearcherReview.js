import { Component } from 'react';
import { div, hr, label, form, textarea } from 'react-hyperscript-helpers';
import { PageHeading } from '../components/PageHeading';
import { SubmitVoteBox } from '../components/SubmitVoteBox';
import { User, Researcher } from "../libs/ajax";
import { ConfirmationDialog } from '../components/ConfirmationDialog';

class ResearcherReview extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showConfirmationDialogOK: false,
      alertMessage: "Your vote has been successfully logged!",
      value: '',
      rationale: '',
      enableVoteButton: false,
      voteStatus: '',
      formData: {
        academicEmail: '',
        address1: '',
        address2: '',
        city: '',
        country: '',
        department: '',
        division: '',
        eRACommonsID: '',
        nihUsername: '',
        linkedIn: '',
        orcid: '',
        researcherGate: '',
        havePI: false,
        havePIValue: '',
        institution: '',
        isThePI: false,
        piEmail: '',
        piName: '',
        piValue: '',
        profileName: '',
        pubmedID: '',
        scientificURL: '',
        state: '',
        zipcode: ''
      },
    };
  }

  componentDidMount() {
    this.findResearcherInfo();
  }

  async findResearcherInfo() {

    let researcher = await Researcher.getPropertiesByResearcherId(this.props.match.params.dacUserId);

    if (researcher.isThePI !== undefined) {
      researcher.isThePI = JSON.parse(researcher.isThePI);
      researcher.piValue = researcher.isThePI === true ? researcher.piValue = 'Yes' : researcher.piValue = 'No';
    }

    if (researcher.havePI !== undefined) {
      researcher.havePI = JSON.parse(researcher.havePI);
      researcher.havePIValue = researcher.havePI === true ? 'Yes' : researcher.havePIValue = 'No';
    }

    let user = await User.getById(this.props.match.params.dacUserId);

    let status = null;
    if (user.status === 'approved') {
      status = true;
    } else if (user.status === 'rejected') {
      status = false;
    }

    this.setState(prev => {
      prev.formData = researcher;
      prev.rationale = user.rationale;
      prev.voteStatus = status;
      prev.voteId = this.props.match.params.dacUserId;
      return prev;
    });
  };

  submitVote = (voteStatus, rationale) => {
    let status = "pending";
    if (voteStatus === true || voteStatus === "true") {
      status = "approved";
    } else if (voteStatus === "false") {
      status = "rejected";
    }
    let userStatus = { status: status, rationale: rationale, roleId: 5 };
    User.registerStatus(userStatus, this.props.match.params.dacUserId).then(
      data => {
        this.setState({ showConfirmationDialogOK: true });
      }
    ).catch(error => {
      this.setState({ showConfirmationDialogOK: true, alertMessage: "Sorry, something went wrong when trying to submit the vote. Please try again." });
    });
  };

  confirmationHandlerOK = (answer) => (e) => {
    this.setState({ showConfirmationDialogOK: false });
    this.props.history.goBack();
  };

  render() {

    const { formData, rationale, voteStatus } = this.state;

    return (
      div({ className: "container " }, [
        div({ className: "col-lg-10 col-lg-offset-1 col-md-10 col-md-offset-1 col-sm-12 col-xs-12" }, [
          PageHeading({ id: "researcherReview", color: "common", title: "Researcher Review", description: "Should this user be classified as Bonafide Researcher?" }),
          hr({ className: "section-separator" })
        ]),

        div({ className: "col-lg-8 col-lg-offset-2 col-md-8 col-md-offset-2 col-sm-12 col-xs-12" }, [
          div({ className: "jumbotron box-vote" }, [

            SubmitVoteBox({
              id: "researcherReview",
              color: "common",
              title: "Your Vote",
              isDisabled: false,
              voteStatus: voteStatus,
              rationale: rationale,
              showAlert: false,
              alertMessage: "something!",
              action: { label: "Vote", handler: this.submitVote },
              key: this.state.voteId
            })
          ])
        ]),

        div({ className: "col-lg-10 col-lg-offset-1 col-md-10 col-md-offset-1 col-sm-12 col-xs-12 no-padding" }, [
          form({ name: "researcherForm", noValidate: true }, [
            div({ className: "row form-group margin-top-20" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["Full Name"]),
                div({ id: "lbl_profileName", className: "control-data", name: "profileName", readOnly: true }, [formData.profileName])
              ]),
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["Academic/Business Email Address"]),
                div({ id: "lbl_profileAcademicEmail", className: "control-data", name: "profileAcademicEmail", readOnly: true}, [formData.academicEmail]),
              ])
            ]),

            div({ className: "row margin-top-20" }, [
              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label rp-title-question default-color" }, ["Researcher Identification"])
              ])
            ]),

            div({ className: "row no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["NIH User Name"]),
                div({ id: "lbl_profileNihUsername", className: "control-data", name: "profileNihUsername",  readOnly: true}, [formData.nihUsername]),
              ]),

              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["LinkedIn Profile"]),
                div({ id: "lbl_profileLinkedIn", className: "control-data", name: "profileLinkedIn", readOnly: true}, [formData.linkedIn]),
              ])
            ]),

            div({ className: "row no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["ORCID iD"]),
                div({ id: "lbl_profileOrcid", className: "control-data", name: "profileOrcid", readOnly: true}, [formData.orcid]),
              ]),
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["ResearchGate ID"]),
                div({ id: "lbl_profileResearcherGate", className: "control-data", name: "profileResearcherGate", readOnly: true}, [formData.researcherGate]),
              ])
            ]),

            div({ className: "row margin-top-20" }, [
              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label" }, ["Institution Name"]),
                div({ id: "lbl_profileInstitution", className: "control-data", name: "profileInstitution", readOnly: true}, [formData.institution]),
              ])
            ]),

            div({ className: "row no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["Department"]),
                div({ id: "lbl_profileDepartment", className: "control-data", name: "profileDepartment", readOnly: true}, [formData.department]),
              ]),
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["Division"]),
                div({ id: "lbl_profileDivision", className: "control-data", name: "profileDivision", readOnly: true}, [formData.division]),
              ])
            ]),

            div({ className: "row no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["Street Address 1"]),
                div({ id: "lbl_profileAddress1", className: "control-data", name: "profileAddress1", readOnly: true}, [formData.address1]),
              ]),
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["Street Address 2"]),
                div({ id: "lbl_profileAddress2", className: "control-data", name: "profileAddress2", readOnly: true}, [formData.address2]),
              ])
            ]),

            div({ className: "row no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["City"]),
                div({ className: "control-data", name: "profileCity", id: "profileCity", readOnly: true}, [formData.city]),
              ]),
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["State"]),
                div({ id: "lbl_profileState", className: "control-data", name: "profileState", readOnly: true}, [formData.state]),
              ])
            ]),

            div({ className: "row no-margin" }, [
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["Zip/Postal Code"]),
                div({ id: "lbl_profileZip", className: "control-data", name: "profileZip", readOnly: true}, [formData.zipcode]),
              ]),
              div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                label({ className: "control-label" }, ["Country"]),
                div({ id: "lbl_profileCountry", className: "control-data", name: "profileCountry", readOnly: true}, [formData.country]),
              ])
            ]),

            div({ className: "row margin-top-20" }, [
              div({ className: "col-xs-12 " + (formData.isThePI === true ? 'col-lg-12 col-md-12 col-sm-12' : 'col-lg-6 col-md-6 col-sm-6') }, [
                label({ className: "control-label" }, ["Is this researcher the Principal Investigator?"]),
                div({ id: "lbl_researcherIsPI", className: "control-data" }, [formData.piValue]),
              ]),

              div({ isRendered: formData.isThePI === false }, [
                div({ className: "col-lg-6 col-md-6 col-sm-6 col-xs-12" }, [
                  label({ className: "control-label" }, ["Does the researcher have a Principal Investigator?"]),
                  div({ id: "lbl_researcherhavePI", className: "control-data", readOnly: true}, [formData.havePIValue]),
                ])
              ])
            ]),

            div({ className: "row no-margin", isRendered: formData.havePI === true }, [
              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label" }, ["Principal Investigator Name"]),
                div({ id: "lbl_profilePIName", className: "control-data", name: "profilePIName", readOnly: true}, [formData.piName]),
              ]),

              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label" }, ["Principal Investigator Email Address"]),
                div({ id: "lbl_profilePIEmail", className: "control-data", name: "profilePIEmail", readOnly: true}, [formData.piEmail]),
              ]),

              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label" }, ["eRA Commons ID"]),
                div({ id: "lbl_profileEraCommons", className: "control-data", name: "profileEraCommons", readOnly: true}, [formData.eRACommonsID]),
              ]),

              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label" }, ["Pubmed ID of a publication"]),
                div({ id: "lbl_profilePubmedId", className: "control-data", name: "profilePubmedID", readOnly: true}, [formData.pubmedID]),
              ]),

              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label" }, ["URL of a scientific publication"]),
                textarea({
                  value: [formData.scientificURL],
                  readOnly: true,
                  name: "profileScientificURL",
                  id: "lbl_profileScientificURL",
                  className: "control-data textarea",
                  maxLength: "512"
                })
              ])
            ]),

            div({ className: "row no-margin", isRendered: formData.isThePI === true || formData.havePI === false }, [
              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label" }, ["Pubmed ID of a publication"]),
                div({ id: "lbl_profilePubmedId", className: "control-data", name: "profilePubmedID", readOnly: true}, [formData.pubmedID]),
              ]),

              div({ className: "col-lg-12 col-md-12 col-sm-12 col-xs-12" }, [
                label({ className: "control-label" }, ["URL of a scientific publication"]),
                textarea({
                  value: [formData.scientificURL],
                  name: "profileScientificURL",
                  id: "lbl_profileScientificURL",
                  className: "control-data textarea",
                  maxLength: "512",
                  readOnly: true
                })
              ])
            ])
          ])
        ]),
        ConfirmationDialog({
          isRendered: this.state.showConfirmationDialogOK,
          title: "Vote confirmation",
          color: "common",
          type: "informative",
          showModal: true,
          action: { label: "Ok", handler: this.confirmationHandlerOK }
        }, [div({ className: "dialog-description" }, [this.state.alertMessage])])

      ])
    );
  }
}

export default ResearcherReview;
