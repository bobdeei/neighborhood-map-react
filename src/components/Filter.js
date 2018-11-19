import React, { Component } from "react";

class Filter extends Component {
  state = {
    query: "",
    filterMarkers: []
  };

  componentWillMount() {
    setTimeout(() => {
      this.setState({
        filterMarkers: this.props.markers
      });
    }, 1000);
  }

  toggleFilterMenu = () => {
    const filter = document.querySelector(".filter");
    filter.classList.toggle("filter-open");
    this.setState({
      query: ""
    });
    this.props.infoWindow.close();
  };

  filterMarkers = e => {
    const { markers, infoWindow } = this.props;
    const filterMarkers = [];
    const query = e.target.value.toLowerCase();
    this.setState({
      query: query
    });

    if (query) {
      infoWindow.close();
      // Display only matched marker
      markers.forEach(marker => {
        if (marker.title.toLowerCase().includes(query)) {
          marker.setVisible(true);
          filterMarkers.push(marker);
        } else {
          marker.setVisible(false);
        }
      });

      this.setState({
        filterMarkers: filterMarkers
      });
    } else {
      // If there's no query then display all markers
      markers.forEach(marker => {
        marker.setVisible(true);
      });
      this.setState({
        filterMarkers: markers
      });
    }
  };

  openInfoWindow = e => {
    const { markers, infoWindow, map } = this.props;
    markers.forEach(marker => {
      // Check for address too because there are 2 Dewey's Pizza in Cincinnati somehow
      if (e.name === marker.name && e.address === marker.address) {
        const { name, address, city } = marker;
        infoWindow.setContent(
          `<div><strong>Name:</strong> ${name}</div>
          <div><strong>Address:</strong> ${address}</div>
          <div><strong>City:</strong> ${city}</div>`
        );
        infoWindow.open(map, marker);

        // Make marker bounce and stop after 1s
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          marker.setAnimation(null);
        }, 1000);
      }
    });
  };

  render() {
    const { query, filterMarkers } = this.state;
    const { markerIcon } = this.props;
    return (
      <div className="container-filter">
        <i
          className="fas fa-bars"
          onClick={this.toggleFilterMenu}
          role="button"
        />
        <h1>Cincinnati Restaurants</h1>
        <div className="filter">
          <div className="filter-panel" />
          <input
            type="text"
            placeholder="Search..."
            onChange={this.filterMarkers}
            aria-labelledby="filter"
            value={query}
          />
          <ul className="filter-list" role="list" tabIndex="0">
            {filterMarkers.map(marker => (
              <li
                key={marker.id}
                onClick={() => this.openInfoWindow(marker)}
                onMouseOver={() => marker.setIcon(markerIcon("6cd6ff"))}
                onMouseOut={() => marker.setIcon(markerIcon("e8453c"))}
              >
                {marker.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default Filter;
