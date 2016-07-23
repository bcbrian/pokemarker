import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import LoadingScreen from '/imports/ui/components/loading-screen.jsx';

import PokemonSelectBox from '/imports/ui/components/pokemon-select-box/pokemon-select-box.jsx';

export class Layout extends React.Component {
  constructor(props) {
    super(props);


  }

  signOut(event){
    event.preventDefault();
    Meteor.logout(()=>{
      FlowRouter.go("/sign-in");
    })
  }
  goToMap(event){
    event.preventDefault();
    window.location.pathname = "/live";
  }
  render(){
    return (
      <div id="app-root">
      <LoadingScreen />
        <header>
          <nav className="navbar navbar-dark bg-inverse navbar-fixed-top">
            <a className="navbar-brand" href="#" onClick={this.goToMap.bind(this)}>
              {/*PokéMarker*/}
              <img src="/img/PM-2.png" />
            </a>




            {/*<button className="navbar-toggler hidden-sm-up pull-right" type="button" data-toggle="collapse" data-target="#exCollapsingNavbar2">
              &#9776;
            </button>*/}
            {/*<div className="collapse navbar-toggleable-xs" id="exCollapsingNavbar2">*/}
              <ul className="nav navbar-nav">
                {/*<li className={"nav-item "+(this.props.isAtHome?"active":"")}>
                <a className="nav-link" href="/">home <span className="sr-only">(current)</span></a>
                </li>*/}

                <li className={"nav-item "+(this.props.isAtSomePage?"active":"")}>
                  <a className="nav-link" href="#" onClick={this.goToMap.bind(this)}><i className="fa fa-map" aria-hidden="true"></i></a>
                </li>

                {/*
                  !this.props.user._id ?
                  <li id="sign-in" className={"nav-item "+(this.props.isAtSignInPage?"active":"")}>
                    <a className="nav-link" href="/sign-in">Sign In</a>
                  </li>
                  : null
                }
                {
                  !this.props.user._id ?
                  <li id="sign-up" className={"nav-item "+(this.props.isAtSignUpPage?"active":"")}>
                    <a className="nav-link" href="/sign-up">Sign Up</a>
                  </li>
                  : null
                }
                {
                  this.props.user._id ?
                  <li id="sign-out" className="nav-item">
                    <a className="nav-link" href="#" onClick={this.signOut.bind(this)}>Sign Out</a>
                  </li>
                  : null
                */}

              </ul>
            {/*</div>*/}


          </nav>
        </header>
      <main>
      {this.props.content}
      </main>
      </div>
    );
  }
}

Layout.propTypes = {
  user: PropTypes.object.isRequired,
};

export default createContainer(() => {
  return {
    user: Meteor.user() ? Meteor.user() : {},
  };
}, Layout);
