import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import {mount} from 'react-mounter';
import { Layout } from "/imports/ui/layouts";
import { PokemonSlowMap } from "/imports/ui/pages/slow-map";
import { PokemonLiveMap } from "/imports/ui/pages/live-map";

FlowRouter.route("/", {
  action() {
    FlowRouter.go("/live");
  }
});
//////////////////////////////////////////////////////////
//LIVE
//////////////////////////////////////////////////////////
FlowRouter.route('/live', {
  action() {
      const pokemon = [];
      mount(Layout, {
        content: <PokemonLiveMap />,
        isAtSomePage: true
      });
  }
});
FlowRouter.route('/live/:top/:bottom/:left/:right', {
  action({top, bottom, left, right}) {


      mount(Layout, {
        content: <PokemonLiveMap bounds={{top, bottom, left, right}}/>,
        isAtSomePage: true
      });

  }
});
FlowRouter.route('/live/pokemon/:pokemonSearchString/:top/:bottom/:left/:right', {
  action({pokemonSearchString, top, bottom, left, right}) {


      mount(Layout, {
        content: <PokemonLiveMap pokemonSearchString={pokemonSearchString} bounds={{top, bottom, left, right}}/>,
        isAtSomePage: true
      });

  }
});
FlowRouter.route('/live/go/:top/:bottom/:left/:right', {
  action({top, bottom, left, right}) {


      mount(Layout, {
        content: <PokemonLiveMap ignoreLocation={true} bounds={{top, bottom, left, right}}/>,
        isAtSomePage: true
      });

  }
});
FlowRouter.route('/live/go/pokemon/:pokemonSearchString/:top/:bottom/:left/:right', {
  action({pokemonSearchString, top, bottom, left, right}) {


      mount(Layout, {
        content: <PokemonLiveMap ignoreLocation={true} pokemonSearchString={pokemonSearchString} bounds={{top, bottom, left, right}}/>,
        isAtSomePage: true
      });

  }
});
//////////////////////////////////////////////////////////
