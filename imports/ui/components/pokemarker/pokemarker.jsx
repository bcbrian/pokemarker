import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Select, { Option } from 'rc-select';
import { pokemonNames } from '/imports/api/pokemon/names.js';
import { pokemons } from "/imports/api/pokemonGo/pokemons.js";
import { thumbedUpByThisUser, thumbedDownByThisUser} from '/imports/api/mapItems/methods.js';

import CountdownTimer from '/imports/ui/components/timer/timer.jsx';

export default class Pokemarker extends Component {
  constructor(props) {
    super(props);

    const selected = false;
    const requestDelete = false;
    const show = true;
    const mapItemId = "";

    this.state = { show, selected, mapItemId };
  }

  setShow(show){
    this.setState({show});
  }
  setMapItemId(mapItemId){ this.setState({ mapItemId }); }
  toggleSelected(){ this.setState({selected : !this.state.selected }); }

  _onClick(event){
    event.preventDefault();
    // event.stopPropagation(); // comment in for different behavior no time to test right now
    this.toggleSelected();
  }

  _delete(mapItemId, event){
    event.preventDefault();
    event.stopPropagation(); // comment in for different behavior no time to test right now
    this.setMapItemId(mapItemId);
    this.props.toggleRequestDelete(this._cancelDelete.bind(this), this.deleteSelectedMarker.bind(this));
  }

  _cancelDelete(event){
    event.preventDefault();
    event.stopPropagation(); // comment in for different behavior no time to test right now
    this.setMapItemId("");
    this.props.toggleRequestDelete(this._cancelDelete.bind(this), this.deleteSelectedMarker.bind(this));
  }

  deleteSelectedMarker(event){
    event.preventDefault();
    event.stopPropagation(); // comment in for different behavior no time to test right now
    this.props.toggleRequestDelete(null, null);
  }

  thumbUp(mapItemId, event){
    event.preventDefault();
    // event.stopPropagation(); // comment in for different behavior no time to test right now
  }

  thumbDown(mapItemId, event){
    event.preventDefault();
    // event.stopPropagation(); // comment in for different behavior no time to test right now
  }
// rgba(200,200,0,1);
  render() {
    return !this.state.show || parseFloat(this.props.pokemon.disappear_time) - parseFloat(Date.now()) < 0 ? null : (
      <div className={"animated bounceIn pokemarker-container " + (this.state.selected ? "selected" : "")}>
        <div className="pokemarker" onClick={this._onClick.bind(this)}>
          <img className="pokemarker-img" src={pokemons.pokemon[parseInt(this.props.pokemon.pokeId)-1].img}/>
          {!this.state.selected ? null : (
            <div>
              <CountdownTimer completeCallback={this.setShow.bind(this, false)} initialTimeRemaining={parseFloat(this.props.pokemon.disappear_time) - parseFloat(Date.now())}/>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Pokemarker.propTypes = {
  pokemon: PropTypes.object.isRequired,
  isOwner: PropTypes.bool.isRequired,
  thumbedUp: PropTypes.bool.isRequired,
  thumbedDown: PropTypes.bool.isRequired,
  toggleRequestDelete: PropTypes.func.isRequired,
};

export default createContainer((params) => {
  let { pokemon, toggleRequestDelete } = params;
  let userId = Meteor.userId();
  let isOwner = pokemon.owner === userId;
  let thumbedUp = thumbedUpByThisUser(pokemon, Meteor.userId());
  let thumbedDown = thumbedDownByThisUser(pokemon, Meteor.userId());
  return { pokemon, userId, isOwner, thumbedUp, thumbedDown, toggleRequestDelete};
}, Pokemarker);
