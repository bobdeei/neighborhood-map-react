import React, { Component } from "react";
import "./App.css";

import {
  GOOGLE_MAP_API_KEY,
  FS_CLIENT_ID,
  FS_CLIENT_SECRET,
  FS_V
} from "./data/auth";
import axios from "axios";

import Map from "./components/Map";
import Filter from "./components/Filter";

class App extends Component {
  state = {
    map: {},
    venues: [],
    markers: [],
    infoWindow: {},
    error: false
  };

  componentDidMount() {
    this.getVenues();
  }

  renderMap = () => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?libraries=geometry&key=${GOOGLE_MAP_API_KEY}&callback=initMap`
    );
    window.initMap = this.initMap;
  };

  getVenues = () => {
    const endPoint = "https://api.foursquare.com/v2/venues/explore?";
    // Define necessary params for axios call
    const params = {
      client_id: FS_CLIENT_ID,
      client_secret: FS_CLIENT_SECRET,
      query: "food",
      near: "cincinnati",
      v: FS_V
    };
    axios
      .get(endPoint + new URLSearchParams(params))
      .then(res =>
        this.setState(
          {
            // Store only first 20 out of 30 venues
            venues: res.data.response.groups[0].items.slice(0, 20),
            error: false
          },
          // After that, call renderMap as a callback
          this.renderMap
        )
      )
      .catch(err => {
        this.setState({
          error: true
        });
        console.log("Error: " + err);
      });
  };

  initMap = () => {
    const { venues } = this.state;

    // Create the map
    const map = new window.google.maps.Map(document.querySelector("#map"), {
      center: { lat: 39.1031, lng: -84.512 },
      mapTypeControl: false,
      fullscreenControl: false,
      zoom: 30
    });

    // New markers mapped from venues will be stored in 'markers'
    const markers = [];
    const infoWindow = new window.google.maps.InfoWindow();
    const bounds = new window.google.maps.LatLngBounds();

    // Display dynamic markers
    venues.forEach(venue => {
      const { id, name, location } = venue.venue;
      const marker = new window.google.maps.Marker({
        id,
        name,
        address: location.address,
        city: location.city,
        position: {
          lat: location.lat,
          lng: location.lng
        },
        map,
        title: name,
        animation: window.google.maps.Animation.DROP
      });
      const defaultIcon = this.markerIcon("e8453c");
      const highlightedIcon = this.markerIcon("6cd6ff");

      marker.setIcon(defaultIcon);

      markers.push(marker);

      // Click on the marker
      marker.addListener("click", () => {
        // Change content of the InfoWindow
        infoWindow.setContent(`
          <div><strong>Name:</strong> ${name}</div>
          <div><strong>Address:</strong> ${location.address}</div>
          <div><strong>City:</strong> ${location.city}</div>
        `);

        infoWindow.open(map, marker);

        // Make marker bounce and stop after 1s
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          marker.setAnimation(null);
        }, 1000);
      });

      // Set default and highlight icon
      marker.addListener("mouseover", () => {
        marker.setIcon(highlightedIcon);
      });
      marker.addListener("mouseout", () => {
        marker.setIcon(defaultIcon);
      });

      bounds.extend(marker.position);
    });

    map.fitBounds(bounds);

    // Stored map, markers, and infoWindow for later passing as props to Filter
    this.setState({
      map,
      markers,
      infoWindow
    });
  };

  markerIcon = color => {
    const markerImage = new window.google.maps.MarkerImage(
      `http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|${color}|40|_|%E2%80%A2`,
      new window.google.maps.Size(21, 34),
      new window.google.maps.Point(0, 0),
      new window.google.maps.Point(10, 34),
      new window.google.maps.Size(21, 34)
    );
    return markerImage;
  };

  render() {
    const { map, markers, infoWindow, error } = this.state;
    return (
      <main>
        {error ? (
          <div id="error">Failed loading data... Please try again!</div>
        ) : (
          <React.Fragment>
            <Filter
              map={map}
              markers={markers}
              infoWindow={infoWindow}
              markerIcon={this.markerIcon}
            />
            <Map />
          </React.Fragment>
        )}
      </main>
    );
  }
}

function loadScript(url) {
  const index = window.document.getElementsByTagName("script")[0];
  const script = window.document.createElement("script");
  script.src = url;
  script.async = true;
  script.defer = true;
  index.parentNode.insertBefore(script, index);

  script.onerror = () => {
    document.querySelector("#root").innerHTML =
      "Error has occurred. Failed to load data. Please try again!";
  };
}

export default App;
