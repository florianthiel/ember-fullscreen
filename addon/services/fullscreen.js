import { computed } from '@ember/object';
import { bind } from '@ember/runloop';
import Evented from '@ember/object/evented';
import Service from '@ember/service';
import { assert } from '@ember/debug';
/* global screenfull */

export default Service.extend(Evented, {
  isFastboot: computed(function() {
    const container = getOwner(this);
    assert('You may only use isFastBoot() on a container-aware object', container && typeof container.lookup === 'function');

    const fastboot = container.lookup('service:fastboot');
    return fastboot ? fastboot.get('isFastBoot') : false;
  }),
  screenfull: computed(function() {
    return this.get('isFastboot') ? null : screenfull;
  }),

  init() {
    this._super(...arguments);
    this.setupListeners();
  },

  setupListeners() {
    if (this.get('isAvailable')) {

      this.updateEnabled();
      this.handler = bind(this, this.updateEnabled);
      this.errorHandler = bind(this, this.onError);

      document.addEventListener(this.screenfull.raw.fullscreenchange, this.handler);
      document.addEventListener(this.screenfull.raw.fullscreenerror, this.errorHandler);
    }
  },

  willDestroy() {
    if (this.get('isAvailable')) {
      document.removeEventListener(this.screenfull.raw.fullscreenchange, this.handler);
      document.removeEventListener(this.screenfull.raw.fullscreenerror, this.errorHandler);
    }
  },

  isEnabled: false,

  isAvailable: computed(function() {
    return this.screenfull.enabled;
  }),

  updateEnabled() {
    let isFullscreenEnabled = this.screenfull.isFullscreen;

    this.set('isEnabled', isFullscreenEnabled);
    this.trigger('fullscreenChange', isFullscreenEnabled);
  },

  onError(event) {
    this.trigger('error', event);
  },

  enable(elem) {
    this.screenfull.request(elem);
  },

  disable() {
    this.screenfull.exit();
  },

  toggle(elem) {
    this.screenfull.toggle(elem);
  }

});
