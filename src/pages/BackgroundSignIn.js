import { User } from '../libs/ajax';
import { Storage } from '../libs/storage';
import { div, form, input, label, textarea, br, h } from 'react-hyperscript-helpers';
import { USER_ROLES } from '../libs/utils';
import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { SpinnerComponent } from '../components/SpinnerComponent';

export default function BackgroundSignIn(props) {
  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  let token = queryParams.get("token");
  let { onSignIn, onError, bearerToken } = props;
  token = bearerToken || (token || '');
  let [loading, setLoading] = useState(token && token !== '');
  let [accessToken, setAccessToken] = useState(token);
  let [formToken, setFormToken] = useState(token);
  let [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      return await User.getMe();
    };

    const redirect = (user) => {
      const page = user.isAdmin ? 'admin_console' :
        user.isChairPerson ? 'chair_console' :
          user.isMember ? 'member_console' :
            user.isResearcher ? 'dataset_catalog' :
              user.isDataOwner ? 'data_owner_console' :
                user.isAlumni ? 'summary_votes' : '/';
      history.push(page);
      if (onSignIn)
        onSignIn();
    };

    const setUserRoleStatuses = (user) => {
      const currentUserRoles = user.roles.map(roles => roles.name);
      user.isChairPerson = currentUserRoles.indexOf(USER_ROLES.chairperson) > -1;
      user.isMember = currentUserRoles.indexOf(USER_ROLES.member) > -1;
      user.isAdmin = currentUserRoles.indexOf(USER_ROLES.admin) > -1;
      user.isResearcher = currentUserRoles.indexOf(USER_ROLES.researcher) > -1;
      user.isDataOwner = currentUserRoles.indexOf(USER_ROLES.dataOwner) > -1;
      user.isAlumni = currentUserRoles.indexOf(USER_ROLES.alumni) > -1;
      Storage.setCurrentUser(user);
      return user;
    };

    const setIsLogged = (user) => {
      Storage.setUserIsLogged(true);
    };

    const performLogin = () => {
      setLoading(true);
      Storage.setGoogleData({ accessToken: accessToken });
      getUser().then(
        user => {
          user = Object.assign(user, setUserRoleStatuses(user));
          setIsLogged();
          setLoading(false);
          redirect(user);
        },
        error => {
          const status = error.status;
          switch (status) {
            case 400:
              if (onError)
                onError(error);
              setLoading(false);
              break;
            case 409:
              // If the user exists, just log them in.
              getUser().then(
                user => {
                  user = Object.assign(user, setUserRoleStatuses(user));
                  setIsLogged();
                  redirect(user);
                  setLoading(false);
                },
                error => {
                  Storage.clearStorage();
                  setLoading(false);
                });
              break;
            case 401:
              setInvalidToken(true);
              setLoading(false);
              break;
            default:
              setInvalidToken(true);
              setLoading(false);
              break;
          }
        });
    };

    if (accessToken)
      performLogin();
    return () => { };
  }, [accessToken, history, onError, onSignIn]);

  return div({}, [
    div({
      isRendered: loading
    }, [
      h(SpinnerComponent, {
        show: true,
        name: 'loadingSpinner',
        loadingImage: '/images/loading-indicator.svg'
      }, [])
    ]),
    form({
      name: 'accessTokenForm',
      encType: 'multipart/form-data',
      isRendered: !loading,
      onSubmit: (e) => {
        e.preventDefault();
        setAccessToken(formToken);
      }
    }, [
      div({ className: 'form-group' }, [
        div({ className: "col-lg-9 col-lg-offset-3 col-md-9 col-lg-offset-3 col-sm-9 col-lg-offset-3 col-xs-8 col-lg-offset-4 bold" }, [
          div({
            isRendered: invalidToken,
            style: { backgroundColor: '#FCEDEB', color: '#D13B07' },
            className: 'col-lg-9 col-md-9 col-sm-9 col-xs-8 bold'
          }, [
            'The provided token is invalid.'
          ]),
          br(),
          label({
            id: 'lbl_accessToken',
            className: 'common-color'
          }, ['Access Token']),
          div({}, [
            textarea({
              name: 'accessToken',
              className: 'form-control',
              style: { maxWidth: '50%' },
              autoFocus: true,
              value: formToken,
              onChange: (e) => { setFormToken(e.target.value); }
            })
          ]),
          div({}, [
            input({
              type: 'submit',
              className: 'col-lg-8 col-md-8 col-sm-12 col-xs-12 btn-primary btn',
              style: { marginTop: '5px', maxWidth: '50%' },
              value: 'Submit'
            })
          ])
        ])
      ])
    ])
  ]);
}