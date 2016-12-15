import { Directive, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange } from '@angular/core';

import * as L from 'leaflet';
import '@asymmetrik/leaflet-filter';

import { LeafletDirective } from '@asymmetrik/angular2-leaflet';


@Directive({
	selector: '[leaflet-filter]'
})
export class LeafletFilterDirective
	implements OnChanges, OnInit {

	leafletDirective: LeafletDirective;

	// Reference to the primary map object
	map: L.Map;
	filterControl: L.Control.FilterControl;
	featureGroup: L.FeatureGroup;

	@Input('leafletFilterOptions') filterOptions: L.Control.FilterControlOptions = null;

	@Input('leafletFilterState') filterState: any;
	@Output('leafletFilterStateChange') filterStateChange: EventEmitter<any> = new EventEmitter<any>();


	constructor(leafletDirective: LeafletDirective) {
		this.leafletDirective = leafletDirective;
	}

	ngOnInit() {
		this.map = this.leafletDirective.getMap();

		// Initialize the draw options (in case they weren't provided)
		this.filterOptions = this.initializeFilterOptions(this.filterOptions);

		// Create the control
		this.filterControl =  L.control.filter(this.filterOptions);

		// Pull out the feature group for convenience
		this.featureGroup = this.filterOptions.featureGroup;

		// Add the control to the map
		this.filterControl.addTo(this.map);

		// Register the main handler for events coming from the draw plugin
		this.map.on('filter:filter', (e: any) => {
			setTimeout(() => { this.filterStateChange.emit(e.geo); });
		});
	}

	ngOnChanges(changes: { [key: string]: SimpleChange }) {

		// Set the filter state
		if (changes['filterState']) {
			this.filterControl.setFilter(changes['filterState'].currentValue);
		}

	}

	initializeFilterOptions(options: L.Control.FilterControlOptions) {

		// Ensure the options have a featureGroup
		if (null == options) {
			options = {
				featureGroup: null
			};
		}
		if (null == options.featureGroup) {
			// No feature group was provided, so we're going to add it ourselves
			options.featureGroup = L.featureGroup();
			this.map.addLayer(options.featureGroup);
		}

		return options;
	}
}
