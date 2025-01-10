exports.formatSpotifyJsonToHtml = (data) => {
    if (!data || !data.items || !Array.isArray(data.items)) {
        return "<p>No tracks found in the JSON data.</p>";
    }

    return `
    <div>
      ${data.items
        .map((item) => {
            const track = item.track;
            if (!track) return '';

            const album = track.album || {};
            const artists = track.artists || [];
            const albumImage = album.images?.[0]?.url || null;

            return `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; display: flex; gap: 15px; align-items: flex-start; background: white;">
              ${
                albumImage
                    ? `<img src="${albumImage}" alt="${album.name}" style="width: 100px; height: 100px; border-radius: 5px; object-fit: cover;">`
                    : ''
            }
              <div>
                <h2 style="margin: 0;">${track.name}</h2>
                <p style="margin: 5px 0; color: #555;"><strong>Album:</strong> ${album.name || 'Unknown'} (${album.album_type || 'Unknown'})</p>
                <p style="margin: 5px 0; color: #555;"><strong>Release Date:</strong> ${album.release_date || 'Unknown'}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Artists:</strong></p>
                <ul>
                  ${artists
                .map(
                    (artist) => `
                        <li>
                          ${artist.name} (<a href="${artist.external_urls?.spotify}" target="_blank">Spotify</a>)
                        </li>
                      `
                )
                .join('')}
                </ul>
                <p style="margin: 5px 0; color: #555;"><strong>Available Markets:</strong> ${
                album.available_markets?.slice(0, 5).join(', ') || 'N/A'
            }${album.available_markets?.length > 5 ? '...' : ''}</p>
                <a href="${track.external_urls?.spotify}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 10px 15px; background-color: #1DB954; color: white; text-decoration: none; border-radius: 5px;">Listen on Spotify</a>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
};