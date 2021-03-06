Nothing really here yet… But eventually it'll be _AWESOME_!

Possible Working Title: *FORSAKEN REALM*

# Libraries used
## Server-side dependencies:
* django 1.4 (https://www.djangoproject.com/)
* tastypie api (http://tastypieapi.org/)
* south (for migrations) (http://south.aeracode.org/)

## Client-side (included in repo):
* jQuery 1.7.2 (http://jquery.com/)
* Underscore.js 1.3.3 (http://underscorejs.org/)
* Backbone.js 0.9.2 (http://backbonejs.org/)
* json2.js (http://www.JSON.org/js.html)

# To-Do:
* Simple map creation ___DONE___
* Terrain effects (right now all terrain are the same outside of color)
    * `<attribute>` `<operator>` `<effect>` (eg `moveCost * 2`) ___DONE___
    * require `<attribute>` `<comparison>` `<value>` (eg `size < 7`) _NOTE: This is partly done. The models have been made, and I wrote a `check` function in the JS to help with enforcing it down the road._
* Game Creation ___DONE___
* Game Joining (Issue #6)
* Basic gameplay - skirmish mode
    * Purchase characters ___DONE___
    * Place characters ___DONE___
    * Move characters ___DONE___
    * Melee/ranged attacks (Issue #1) ___DONE___
    * End turn ___DONE___
    * End-of-game checking (Issue #3) ___DONE___
    * Enforce maxMove attribute (Issue #4)
* Simple, dumb AI (basically just need to put the hooks in there that a real AI would use, and then make a dummy AI that just picks an action at random) (Issue #2) ___DONE___ _(although I didn't make it as extendable as I had originally planned, gonna have to add a bit of extra code to actually get that right)_

## Down the road ideas:
* Other game modes (CTF, race, ability to add NPCs, co-op)
* Character sets (to make it easier to choose what characters should be included in games, especially once there's more user-created content)
* Campaign (First just a number of game types lined up in a row, later add some abilities to include storyline)
* Tournament
* Linking maps to character sets
* Player stats/rankings
* Custom attributes (abilities that only apply to certain character sets or game types)
* Abilities (Effects on surrounding characters, etc)
* Cell-specific effects (Permanent modifiers that are attached to specific locations on a map) _NOTE: Functionally, this is done. There's just no way to add them in the map editor._
* Character icons
* Limit initial placement/# of players as a map setting
* Push server (either use my own Node.JS server with Socket.IO or use something like PubNub or Photon Server/Cloud)
* In-game messaging
* HTML5 audio (on button presses, etc)
