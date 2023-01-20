import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit {
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  public outlineName = 'outline-layer';
  public fillAreaName = 'avalanche-paths-fill';
  public zoomLevel = 7;

  lat = 26.3398;
  lng = -81.7787;

  constructor() {}

  ngOnInit() {
    mapboxgl as typeof mapboxgl;
    this.map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoiZHBpZXRyb2NhcmxvIiwiYSI6ImNram9tOGFuMTBvb3oyeXFsdW5uYmJjNGQifQ._zE6Mub0-Vpl7ggMj8xSUQ',
      container: 'map',
      style: this.style,
      zoom: 2,
      center: [this.lng, this.lat],
    });

    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());
    const southWest = new mapboxgl.LngLat(this.lng, this.lat);
    const northEast = new mapboxgl.LngLat(this.lng + 2, this.lat + 2);
    const boundingBox = new mapboxgl.LngLatBounds(southWest, northEast);
  }

  public addRadar() {
    this.map.addSource('radar', {
      type: 'image',
      url: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
      coordinates: [
        [-80.425, 46.437],
        [-71.516, 46.437],
        [-71.516, 37.936],
        [-80.425, 37.936],
      ],
    });
    this.map.addLayer({
      id: 'radar-layer',
      type: 'raster',
      source: 'radar',
      paint: {
        'raster-fade-duration': 0,
      },
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: true,
        trash: true,
      },
      // Set mapbox-gl-draw to draw by default.
      // The user does not have to click the polygon control button first.
      defaultMode: 'draw_polygon',
    });
    this.map.addControl(draw);
  }

  addExistingSource() {
    const coordinates = {
      type: 'Polygon',
      coordinates: [
        [
          [-72.01332405926594, 2.422939744658918],
          [-72.42780859923677, 2.572908352461006],
          [-72.42217301977338, 2.221804989282432],
          [-72.09830702018196, 2.246795552425312],
          [-72.01332405926594, 2.422939744658918],
        ],
      ],
    };
    this.map.addSource('radar', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: coordinates.type,
          coordinates: coordinates.coordinates,
        },
      },
    });

    // fill the area
    // this.map.addLayer({
    //   id: this.fillAreaName,
    //   type: 'fill',
    //   source: 'radar',
    //   paint: {
    //     'fill-color': '#FFD742',
    //     'fill-opacity': 0.5,
    //   },
    // });

    // Add an outline around the polygon.
    // user should draw new polygon with this boundary only
    this.map.addLayer({
      id: this.outlineName,
      type: 'line',
      source: 'radar',
      layout: {},
      paint: {
        'line-color': '#FFD742',
        'line-width': 2,
      },
    });

    this.map.fitBounds(
      [
        coordinates.coordinates[0][0],
        coordinates.coordinates[0][coordinates.coordinates[0].length - 1],
      ],
      { zoom: this.zoomLevel }
    );

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: true,
        trash: true,
      },
      // Set mapbox-gl-draw to draw by default.
      // The user does not have to click the polygon control button first.
      defaultMode: 'draw_polygon',
    });
    this.map.on('draw.create', (e) => this.updateArea(e));
    this.map.on('draw.delete', (e) => this.updateArea(e));
    this.map.on('draw.update', (e) => this.updateArea(e));
    this.map.addControl(draw);
    // Adding click event just after draw mode is active
    this.map.on('click', (e) => {
      this.checkCoordinates(e.lngLat);
    });
  }

  // use this function to calculate new added boundaries
  updateArea(e: any) {
    //console.log(e.features[0]);
  }

  checkCoordinates(data) {
    // parent region and user is allowed to draw only with-in this region
    const coordinates = {
      type: 'Polygon',
      coordinates: [
        [
          [-72.01332405926594, 2.422939744658918],
          [-72.42780859923677, 2.572908352461006],
          [-72.42217301977338, 2.221804989282432],
          [-72.09830702018196, 2.246795552425312],
          [-72.01332405926594, 2.422939744658918],
        ],
      ],
    };
    const arr = coordinates.coordinates[0];

    // using 0th index and 1st index coordinates for bounding because
    //  the first coordinate pair referring to the southwestern corner of the box (the minimum longitude and latitude) and the second referring to the northeastern corner of the box (the maximum longitude and latitude).
    // reference Link -> https://docs.mapbox.com/help/glossary/bounding-box/
    const boundingBox = new mapboxgl.LngLatBounds(arr[0], arr[1]);
    console.log('bounding-box result', boundingBox.contains(data));

    const llv = mapboxgl.LngLatBounds.convert(arr);
    console.log('array result', llv.contains(data));
  }
}
