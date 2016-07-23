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
    const showAddMarkerMsg = "No message set.";
    const showPleaseThumbsUp = false;
    const selectedPokemon = "none";
    const selectedSearch = "all";
    const zoom = 17;
    const top=0, right=0, bottom=0, left=0;
    const requestDelete = false;
    const marking = false;
    const knowWhereUserIs = false;
    const pokemon = [];
    const lastClicked = false;
    const _cancelDelete = ()=>{return true;};
    const deleteSelectedMarker = ()=>{return true;};

    incWatingOn();


    this.state = {showAddMarkerMsg, pokemon, lastClicked, gotInitialLocation, currentLocation, pokemonLocation, userCurrentLocation, knowWhereUserIs, showAddMarker, showPleaseThumbsUp, selectedPokemon, selectedSearch, zoom, top, right, bottom, left, requestDelete, marking, _cancelDelete, deleteSelectedMarker };
  }

  setSelectedSearch(selectedSearch){
    this.setState({selectedSearch});
    if (selectedSearch==='all'){
      FlowRouter.go("/live/"+this.state.top+"/"+this.state.bottom+"/"+this.state.left+"/"+this.state.right);
    }else{
      FlowRouter.go("/live/pokemon/"+selectedSearch+"/"+this.state.top+"/"+this.state.bottom+"/"+this.state.left+"/"+this.state.right);
    }
  }

  setPokemon(pokemon){ this.setState({pokemon}); }
  setLastClicked(lastClicked){ this.setState({lastClicked}); }
  setGotInitialLocation(gotInitialLocation){ this.setState({gotInitialLocation}); }
  setCurrentLocation(currentLocation){ this.setState({currentLocation}); }
  setUserCurrentLocation(userCurrentLocation){ this.setState({userCurrentLocation}); }
  setKnowWhereUserIs(knowWhereUserIs){ this.setState({knowWhereUserIs}); }
  setPokemonLocation(pokemonLocation){ this.setState({pokemonLocation}); }
  setShowAddMarker(showAddMarker){ this.setState({showAddMarker}); }
  setShowAddMarkerMsg(showAddMarkerMsg){ this.setState({showAddMarkerMsg}); }
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

  searchForPokemon(){
    if(this.state.lastClicked - Date.now() > 0){
      this.setShowAddMarker(true);
      this.setShowAddMarkerMsg("Please Wait 30 seconds before before searching again. Thank you!");
      return;
    }
    incWatingOn();
    // this.setPokemon([{
    //   "_id" : "QxXMHNPYmQC7EMmiA",
    //   "spawnPointId" : "52b32a69c63",
    //   "disappear_time" : Date.now() + 5000,
    //   "name" : "weedle",
    //   "pokeId" : "13",
    //   "time" : 2016,
    //   "lat" : 45.00852147366133,
    //   "lng" : -93.12167060000002
    // }]);
    this.setLastClicked(Date.now()+30000);
    Meteor.call('getLivePokemon', this.state.currentLocation, (error, pokemon) => {
      if(error){
        this.setShowAddMarker(true);
        this.setShowAddMarkerMsg(error.message || "There was an error logging into Pokemon Go... The servers might be down");
        decWatingOn();
        return;
      }
      this.setPokemon(pokemon);
      decWatingOn();
    });
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
      FlowRouter.go("/live/"+top+"/"+bottom+"/"+left+"/"+right);
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

  render() {
    !this.state.gotInitialLocation && this.getCurrentLocation();
    return isWatingOn() && !this.state.lastClicked ? null : (
        <div className="pm-all-page">
          {
             !this.state.showAddMarker ? null : (
              <div className="fixed-container-background" >

                   <div className="animated fadeInDown fixed-container">
                     <h3>{this.state.showAddMarkerMsg}</h3>
                     <button type="button" className="btn btn-lg btn-warning-outline" onClick={this.setShowAddMarker.bind(this, false)}> OK </button>
                   </div>

              </div>
            )
          }


          <div className="animated fadeInDown pokemon-select-box ">

            <button type="button" onClick={this.searchForPokemon.bind(this)} className="btn btn-success pull-right"><i className="fa fa-search" aria-hidden="true"></i></button>

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
            onChange={this._onChange.bind(this)}
            center={this.state.currentLocation}
            zoom={this.state.zoom}>
            {this.state.pokemon.map((pokemon) => {
              return(
                <Pokemarker key={pokemon._id} pokemon={pokemon} lat={pokemon.lat} lng={pokemon.lng} />
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
          <div style={{
              position: "fixed",
              width: "100%",
              height: 100,
              bottom: 0,
              zIndex: 10000,
              textAlign: "center"
            }}
          >

            <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>

            <ins className="adsbygoogle"
            style={{
              display: 'inline-block',
              width: 320,
              height: 100,
              position: 'relative',
              zIndex: 10000,
            }}
            data-ad-client="ca-pub-5106517002115014"
            data-ad-slot="6164748687"></ins>
            <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
          </div>

        </div>
      )
  }
};
// 45.0084471 -93.1216062

SlowMapPage.propTypes = {
  user: PropTypes.object.isRequired,
  // pokemon: PropTypes.array.isRequired,
};

export default createContainer((params) => {
  let {pokemonSearchString, bounds, ignoreLocation, pokemon} = params;
  let {top, bottom, left, right} = bounds || {top:44.938043, bottom:44.938043, left:-93.121, right:-93.121};
  return {
    user: Meteor.user() ? Meteor.user() : {},
    // pokemon : pokemon,
    ignoreLocation : ignoreLocation ? ignoreLocation : false,
    currentLocation : bounds ? {
      lat : ( parseFloat(top) + parseFloat(bottom) ) / 2,
      lng : ( parseFloat(right) + parseFloat(left) ) / 2
    } : {},
  };
}, SlowMapPage);
