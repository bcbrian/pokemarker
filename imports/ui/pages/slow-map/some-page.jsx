import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { incWatingOn, decWatingOn, isWatingOn } from '/imports/api/loadingCounter/methods.js';

import PokemonSelectBox from '/imports/ui/components/pokemon-select-box/pokemon-select-box.jsx';

import GoogleMap from 'google-map-react';
import { pokemonNames } from '/imports/api/pokemon/names.js';
import { Pokemon } from "/imports/api/pokemon/pokemon.js";
import Pokemarker from "/imports/ui/components/pokemarker/pokemarker.jsx";

export class SlowMapPage extends Component {
  constructor(props) {
    super(props);

    // const currentLocation = {lat: 45.008426799999995, lng: -93.1216022};
    const gotInitialLocation = false;
    const currentLocation = props.currentLocation ? props.currentLocation : {lat: 44.938043, lng: -93.121};
    const userCurrentLocation = {lat: 44.938043, lng: -93.121};
    const pokemonLocation = {lat: 44.938043, lng: -93.121};
    const showAddMarker = false;
    const showPleaseThumbsUp = false;
    const selectedPokemon = "none";
    const selectedSearch = "all";
    const zoom = 17;
    const top=0, right=0, bottom=0, left=0;
    const requestDelete = false;
    const marking = false;
    const knowWhereUserIs = false;
    const _cancelDelete = ()=>{return true;};
    const deleteSelectedMarker = ()=>{return true;};

    incWatingOn();


    this.state = {gotInitialLocation, currentLocation, pokemonLocation, userCurrentLocation, knowWhereUserIs, showAddMarker, showPleaseThumbsUp, selectedPokemon, selectedSearch, zoom, top, right, bottom, left, requestDelete, marking, _cancelDelete, deleteSelectedMarker };
  }

  setSelectedSearch(selectedSearch){
    this.setState({selectedSearch});
    if (selectedSearch==='all'){
      FlowRouter.go("/map/"+this.state.top+"/"+this.state.bottom+"/"+this.state.left+"/"+this.state.right);
    }else{
      FlowRouter.go("/map/pokemon/"+selectedSearch+"/"+this.state.top+"/"+this.state.bottom+"/"+this.state.left+"/"+this.state.right);
    }
  }

  setGotInitialLocation(gotInitialLocation){ this.setState({gotInitialLocation}); }
  setCurrentLocation(currentLocation){ this.setState({currentLocation}); }
  setUserCurrentLocation(userCurrentLocation){ this.setState({userCurrentLocation}); }
  setKnowWhereUserIs(knowWhereUserIs){ this.setState({knowWhereUserIs}); }
  setPokemonLocation(pokemonLocation){ this.setState({pokemonLocation}); }
  setShowAddMarker(showAddMarker){ this.setState({showAddMarker}); }
  setShowPleaseThumbsUp(showPleaseThumbsUp){ this.setState({showPleaseThumbsUp}); }
  setZoom(zoom){ this.setState({zoom}); }

  toggleRequestDelete(_cancelDelete, deleteSelectedMarker){
    this.setState({
      requestDelete : !this.state.requestDelete,
      _cancelDelete: _cancelDelete,
      deleteSelectedMarker: deleteSelectedMarker
    });
  }

  toggleMarking(){
    this.setState({
      marking : !this.state.marking
    });
  }

  addZoom(){
    if(this.state.zoom >= 20){
      return this.setState({zoom:20});
    }
    this.setState({zoom:this.state.zoom+0.5});
  }
  subZoom(){
    if(this.state.zoom <= .5){
      return this.setState({zoom:.5});
    }
    this.setState({zoom:this.state.zoom-0.5});
  }

  getCurrentLocation(){
    if(this.props.ignoreLocation){
      isWatingOn() && decWatingOn();
      return this.state.currentLocation;
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        isWatingOn() && decWatingOn();
        let {coords} = position;
        let {latitude, longitude} = coords;
        this.setCurrentLocation({lat : latitude, lng : longitude});
        this.setUserCurrentLocation({lat : latitude, lng : longitude});
        this.setGotInitialLocation(true);
        this.setKnowWhereUserIs(true);
      }, (error) => {
        isWatingOn() && decWatingOn();
        console.log("ERROR: ", error);
        this.setGotInitialLocation(true);
      });
      // isWatingOn() && decWatingOn();
      return this.state.currentLocation;
    }
  }

  shouldNotShowAddMarker(){
    return !this.props.user._id || !this.state.showAddMarker;
  }

  _onClick({x, y, lat, lng, event}){
    console.log('EVENT: ', event.target);
    if(this.state.marking){
      if(event.target.className.includes("pokemarker")) {
        // this.setCurrentLocation({ lat, lng });
      } else {
        this.setPokemonLocation({ lat, lng });
        this.setShowAddMarker(true);
      }
    }
  }

  _onChange({center, zoom, bounds, marginBounds, size}){
    this.setState({
      currentLocation: center,
      zoom: zoom,
    });
    this.setBounds(bounds);
  }

  setBounds({nw, se}){
    let top = nw.lat;
    let bottom = se.lat;
    let left = nw.lng;
    let right = se.lng;
    this.setState({ top, bottom, left, right });
    if(!FlowRouter.getParam("top")){
      FlowRouter.go("/map/"+top+"/"+bottom+"/"+left+"/"+right);
    }else{
      FlowRouter.setParams({ top, bottom, left, right });
    }
  };

  goToUser(){
    this.setCurrentLocation(this.state.userCurrentLocation);
    this.setZoom(17);
  }

  setSelectedPokemon(selectedPokemon){
    this.setState({
      selectedPokemon
    });
  }

  addItem(){
    // incWatingOn();
    if(pokemonNames.indexOf(this.state.selectedPokemon) === -1){
      return;
    }
    let item={
      type:"pokemon",
      searchString:this.state.selectedPokemon,
      location:this.state.pokemonLocation,
      thumbsUp:0,
      thumbsDown:0,
      thumbs:{
        up:[],//(user._id)s
        down:[]
      },
      owner:this.props.user._id,
      time: Date.now(),
    }
    Meteor.call("mapItem:insert", item, (error, results) => {
      if(error){
        console.log(error);
      }else if(results === false){
        this.setShowAddMarker(false);
        this.setShowPleaseThumbsUp(true);
      } else {
        this.setShowAddMarker(false);
      }

      // decWatingOn();
    });
  }

  render() {
    !this.state.gotInitialLocation && this.getCurrentLocation();
    return isWatingOn() ? null : (
        <div className="pm-all-page">
          {
             !this.state.showAddMarker ? null : (
              <div className="fixed-container-background" >
              {
                 !this.props.user._id ? (
                   <div className="animated fadeInDown fixed-container">
                     <h3>Sign In to add Pokemon Locations</h3>
                     <button type="button" className="btn btn-lg btn-warning-outline" onClick={this.setShowAddMarker.bind(this, false)}> OK </button>
                   </div>
                ) : (
                  <div className="animated fadeInDown fixed-container">
                    <PokemonSelectBox helperText={"pokemon spotted"} chooseAll={true} selectedCallBack={this.setSelectedPokemon.bind(this)} />
                    <br />
                    <div className="row">
                      <div className="col-xs-6">
                        <button type="button" className="btn btn-lg btn-danger-outline form-control" onClick={this.setShowAddMarker.bind(this, false)}> CANCEL </button>
                      </div>
                      <div className="col-xs-6">
                        <button type="button" className="btn btn-lg btn-primary-outline form-control" onClick={this.addItem.bind(this)}> ADD </button>
                      </div>
                    </div>
                  </div>
                )
              }
              </div>
            )
          }
          {
             !this.state.showPleaseThumbsUp ? null : (
              <div className="animated fadeInDown fixed-container-background" >
                 <div className="fixed-container">
                   <h3>Already spotted {this.selectedPokemon} in the area. Please thumbs up.</h3>
                   <button type="button" className="btn btn-lg btn-warning-outline" onClick={this.setShowPleaseThumbsUp.bind(this, false)}> OK </button>
                 </div>
              </div>
            )
          }
          <div className="animated fadeInDown pokemon-select-box">
          { false ? (
            <div className="row">
              <div className="col-xs-7">
                <PokemonSelectBox helperText={"filter by pokemon"} chooseAll={true} selectedCallBack={this.setSelectedSearch.bind(this)} />
              </div>
              <div className="col-xs-5">
                <button type="button" onClick={this.toggleMarking.bind(this)} className={"btn marking"+ (this.state.marking ? "-on" : "-off")}>{this.state.marking ? "SEARCH" : "MARK"}</button>
              </div>
            </div>

          ) : (
            <PokemonSelectBox helperText={"filter by pokemon"} chooseAll={true} selectedCallBack={this.setSelectedSearch.bind(this)} />
          ) }
          </div>
          <div className="animated fadeInDown pokemon-zoom-box">
            <div style={{transform: "translate(0%, -50%)"}}className="btn-group-vertical" role="group" aria-label="Basic example">
              <button type="button" className="btn btn-secondary" onClick={this.addZoom.bind(this)}><i className="fa fa-plus" aria-hidden="true"></i></button>
              { !this.state.knowWhereUserIs ? null : (
                <button type="button" className="btn btn-secondary" onClick={this.goToUser.bind(this)}><i className="fa fa-location-arrow" aria-hidden="true"></i></button>
              )}
              <button type="button" className="btn btn-secondary" onClick={this.subZoom.bind(this)}><i className="fa fa-minus" aria-hidden="true"></i></button>
            </div>
          </div>
          <GoogleMap
            bootstrapURLKeys={{
              key: "AIzaSyCx-ASOEPJtBfaAQnJEZfOkwv9EUv8-nYg",
              language: 'en'
            }}
            options={{
              disableDefaultUI: true
            }}
            onClick={this._onClick.bind(this)}
            onChange={this._onChange.bind(this)}
            center={this.state.currentLocation}
            zoom={this.state.zoom}>
            {this.props.pokemon.map((pokemon) => {
              return(
                <Pokemarker key={pokemon._id} pokemon={pokemon} lat={pokemon.lat} lng={pokemon.lng} toggleRequestDelete={this.toggleRequestDelete.bind(this)}/>
              )
            })}
            { !this.state.knowWhereUserIs ? (
              <div></div>
            ) : (
              <div className="animated bounceIn where-is-user-container" lat={this.state.userCurrentLocation.lat} lng={this.state.userCurrentLocation.lng}>
                <div className="animated pulse infinite where-is-user"></div>
              </div>
            )}
          </GoogleMap>
          {!this.state.requestDelete ? null : (
            <div className="fixed-container-background" >
              <div className="animated fadeInDown fixed-container pokemarker-container-js">
                <h3>Are you sure you want to delete this marker?</h3>
                <br />
                <div className="row">
                  <div className="col-xs-6">
                    <button type="button" className="pokemarker-cancel-delete-button-js btn btn-lg btn-warning-outline form-control" onClick={this.state._cancelDelete.bind(this)}> CANCEL </button>
                  </div>
                  <div className="col-xs-6">
                    <button type="button" className="pokemarker-delete-button-js btn btn-lg btn-danger-outline form-control" onClick={this.state.deleteSelectedMarker.bind(this)}> DELETE </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )
  }
};
// 45.0084471 -93.1216062

SlowMapPage.propTypes = {
  user: PropTypes.object.isRequired,
  pokemon: PropTypes.array.isRequired,
};

export default createContainer((params) => {
  let {pokemonSearchString, bounds, ignoreLocation, pokemon} = params;
  let {top, bottom, left, right} = bounds || {top:44.938043, bottom:44.938043, left:-93.121, right:-93.121};
  return {
    user: Meteor.user() ? Meteor.user() : {},
    pokemon : pokemon,
    ignoreLocation : ignoreLocation ? ignoreLocation : false,
    currentLocation : bounds ? {
      lat : ( parseFloat(top) + parseFloat(bottom) ) / 2,
      lng : ( parseFloat(right) + parseFloat(left) ) / 2
    } : {},
  };
}, SlowMapPage);
