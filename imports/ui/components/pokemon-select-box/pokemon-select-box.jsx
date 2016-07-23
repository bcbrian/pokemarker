import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Select, { Option } from 'rc-select';
import { pokemonNames } from '/imports/api/pokemon/names.js';

export default class PokemonSelectBox extends Component {
  constructor(props) {
    super(props);
    let disabled = false;
    let value = props.defaultValue

    this.state = { disabled, value };
  }

  onChange(value) { this.setState({ value }); }

  onKeyDown(e) {
    if (e.keyCode === 13) {
    }
  }

  onSelect(v) {
    this.props.selectedCallBack(v);
  }

  toggleDisabled() {
    this.setState({
      disabled: !this.state.disabled,
    });
  }

  render() {
    return (
      <div onKeyDown={this.onKeyDown.bind(this)}>
        {/*{this.state.value && this.state.value !== "all" ? <img className="pokeSelectImg" src={"/img/pokemon/"+this.state.value.replace(/ /g,"_")+".png"}/> : null }*/}
        <Select
          disabled={this.state.disabled}
          onChange={this.onChange.bind(this)}
          onSelect={this.onSelect.bind(this)}
          defaultActiveFirstOption={false}
          notFoundContent=""
          allowClear
          placeholder={this.props.helperText || "filter by pokemon"}
          value={this.state.value}
          combobox
        >
          {this.props.chooseAll ? <Option value="all"> all </Option> : null }

          {pokemonNames.map((name)=>{
            return (
              <Option key={name} value={name}><img className="pokeSelectImg" src={"/img/pokemon/"+name.replace(/ /g,"_").replace(/\'/g,"_")+".png"}/>{name}</Option>
            );
          })}
        </Select>
      </div>
    );
  }
}

PokemonSelectBox.propTypes = {
  selectedCallBack: PropTypes.func.isRequired
};

export default createContainer((params) => {
  let { selectedCallBack, defaultValue, chooseAll, helperText } = params;
  return { selectedCallBack, defaultValue, chooseAll, helperText };
}, PokemonSelectBox);
