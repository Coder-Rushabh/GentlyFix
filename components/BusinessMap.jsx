import React, { useMemo } from 'react';
import { WebView } from 'react-native-webview';

// Leaflet + OpenStreetMap inside a WebView: no API key or native maps SDK needed.
const safeJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

export default function BusinessMap({ businesses, center, onSelect }) {
  const html = useMemo(() => {
    const pts = businesses.map((b) => ({ id: b.id, lat: b.lat, lng: b.lng, name: b.name }));
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#m{height:100%;margin:0}</style></head><body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var pts=${safeJson(pts)}, me=${safeJson(center)};
var map=L.map('m').setView([me.lat,me.lng],12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
var bounds=[];
pts.forEach(function(p){
  var m=L.circleMarker([p.lat,p.lng],{radius:10,color:'#fff',weight:2,fillColor:'#0891A6',fillOpacity:1}).addTo(map);
  m.on('click',function(){window.ReactNativeWebView.postMessage(p.id)});
  bounds.push([p.lat,p.lng]);
});
L.circleMarker([me.lat,me.lng],{radius:7,color:'#fff',weight:2,fillColor:'#2962FF',fillOpacity:1}).addTo(map);
if(bounds.length){bounds.push([me.lat,me.lng]);map.fitBounds(bounds,{padding:[40,40],maxZoom:15});}
</script></body></html>`;
  }, [businesses, center]);

  return (
    <WebView
      originWhitelist={['https://*', 'about:blank']}
      source={{ html, baseUrl: 'https://gentlyfix.app/' }}
      onMessage={(e) => onSelect(e.nativeEvent.data)}
      style={{ flex: 1 }}
    />
  );
}
