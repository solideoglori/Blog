import { Page, Text, View, Document} from '@react-pdf/renderer';
import { h } from 'react-hyperscript-helpers';
import { m } from 'react-select/dist/index-52626178.esm';

const pageStyle = {
  flexDirection: 'row',
  // justifyContent: 'space-around', //NOTE: revisit, this, see if this is necessary
  margin: 10,
  padding: 10
};

const inputStyle = {
  fontSize: '14px',
  fontFamily: 'Roboto, sans-serif',
  flex: 1,
  margin: 10, //revisit this and padding, see if this works or if it needs adjustments
  padding: 10
};

export default function DarPdf(props) {
//props should have dar formData ready to go
  const formData = {props};

  const sharedCollaboratorTemplate = (staff) => {
    return (
      h(View, {}, [
        h(View, {}, [
          h(Text, {}, [`Name: ${staff.name}`]),
          h(Text, {}, [`Title: ${staff.title}`])
        ]),
        h(View, {}, [
          h(Text, {}, [`NIH eRA Commons ID: ${staff.eraCommonsId}`]),
          h(Text, {}, [`Email: ${staff.email}`])
        ])
      ])
    );
  };

  //make sure this partial, alongside the collaborator template, works properly
  const labCollaboratorsTemplate = formData.labCollaborators.map((staff) => {
    return (
      h(View, {} , [
        sharedCollaboratorTemplate,
        h(View, {}, [
          h(Text, {}, [`Are you requesting permission for this member of the Internal Lab Staff to be given "Designated Download/Approval" status? ${staff.approverStatus}`])
        ])
      ])
    );
  });

  const collaboratorsTemplate = (collaborators) => {
    return formData.internalCollaborators.map((collaborator) =>
      h(View, {}, [
        sharedCollaboratorTemplate(collaborator)
      ])
    );
  };

  return (
    h(Document, [
      h(Page, {size: "A4", style: pageStyle}, [
        h(View, {}, [ //question header
          h(Text, {}, ['1. Researcher Information']),
          h(View, {}, [ //subquestion view
            h(Text, {}, ['1.1 Researcher']),
            h(Text, {}, formData.researcher),
          ]),
          h(View, {}, [
            h(Text, { isRendered: formData.checkCollaborator }, [ //NOTE: check to see if isRendered works properly
              'I am an NIH Intramural researcher (NIH email required), or internal collaborator of the PI for the selected dataset(s)'
            ]),
            h(Text, {}, [`LinkedIn Profile`, `${formData.linkedin}`]),
            h(Text, {}, [`ORCID iD: ${formData.orcid}`]),
            h(Text, {}, [`ResearchGate ID: ${formData.researcherGate}`]),
          ]),
          h(View, {}, [
            h(Text, {}, ['1.3 Principal Investigator']),
            h(Text, {}, [formData.investigator])
          ]),
          h(View, {}, [
            h(Text, {}, ['1.4 Internal Lab Staff']),
            h(View, {}, labCollaboratorsTemplate)
          ]),
          h(View, {}, [
            h(Text, {}, ['1.5 Internal Collaborators']),
            h(View, {}, collaboratorsTemplate(formData.internalCollaborators)),
          ]),
          h(View, {}, [
            h(Text, {}, ['1.6 Institutional Signing Official']),
            h(Text, {}, [formData.signingOfficial])
          ]),
          h(View, {}, [
            h(Text, {}, ['1.7 Information Texhnology (IT) Director']),
            h(Text, {}, [formData.itDirector])
          ])
        ]),
      ])
    ])
  );
};