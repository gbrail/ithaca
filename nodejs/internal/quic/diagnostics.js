'use strict';

// TODO(@jasnell) Temporarily ignoring c8 covrerage for this file while tests
// are still being developed.
/* c8 ignore start */
var dc = require('diagnostics_channel');
var onEndpointCreatedChannel = dc.channel('quic.endpoint.created');
var onEndpointListeningChannel = dc.channel('quic.endpoint.listen');
var onEndpointClosingChannel = dc.channel('quic.endpoint.closing');
var onEndpointClosedChannel = dc.channel('quic.endpoint.closed');
var onEndpointErrorChannel = dc.channel('quic.endpoint.error');
var onEndpointBusyChangeChannel = dc.channel('quic.endpoint.busy.change');
var onEndpointClientSessionChannel = dc.channel('quic.session.created.client');
var onEndpointServerSessionChannel = dc.channel('quic.session.created.server');
var onSessionOpenStreamChannel = dc.channel('quic.session.open.stream');
var onSessionReceivedStreamChannel = dc.channel('quic.session.received.stream');
var onSessionSendDatagramChannel = dc.channel('quic.session.send.datagram');
var onSessionUpdateKeyChannel = dc.channel('quic.session.update.key');
var onSessionClosingChannel = dc.channel('quic.session.closing');
var onSessionClosedChannel = dc.channel('quic.session.closed');
var onSessionReceiveDatagramChannel = dc.channel('quic.session.receive.datagram');
var onSessionReceiveDatagramStatusChannel = dc.channel('quic.session.receive.datagram.status');
var onSessionPathValidationChannel = dc.channel('quic.session.path.validation');
var onSessionNewTokenChannel = dc.channel('quic.session.new.token');
var onSessionTicketChannel = dc.channel('quic.session.ticket');
var onSessionVersionNegotiationChannel = dc.channel('quic.session.version.negotiation');
var onSessionOriginChannel = dc.channel('quic.session.receive.origin');
var onSessionHandshakeChannel = dc.channel('quic.session.handshake');
var onSessionGoawayChannel = dc.channel('quic.session.goaway');
var onSessionEarlyRejectedChannel = dc.channel('quic.session.early.rejected');
var onStreamClosedChannel = dc.channel('quic.stream.closed');
var onStreamHeadersChannel = dc.channel('quic.stream.headers');
var onStreamTrailersChannel = dc.channel('quic.stream.trailers');
var onStreamInfoChannel = dc.channel('quic.stream.info');
var onStreamResetChannel = dc.channel('quic.stream.reset');
var onStreamBlockedChannel = dc.channel('quic.stream.blocked');
var onSessionErrorChannel = dc.channel('quic.session.error');
var onEndpointConnectChannel = dc.channel('quic.endpoint.connect');
module.exports = {
  onEndpointCreatedChannel,
  onEndpointListeningChannel,
  onEndpointClosingChannel,
  onEndpointClosedChannel,
  onEndpointErrorChannel,
  onEndpointBusyChangeChannel,
  onEndpointClientSessionChannel,
  onEndpointServerSessionChannel,
  onSessionOpenStreamChannel,
  onSessionReceivedStreamChannel,
  onSessionSendDatagramChannel,
  onSessionUpdateKeyChannel,
  onSessionClosingChannel,
  onSessionClosedChannel,
  onSessionReceiveDatagramChannel,
  onSessionReceiveDatagramStatusChannel,
  onSessionPathValidationChannel,
  onSessionNewTokenChannel,
  onSessionTicketChannel,
  onSessionVersionNegotiationChannel,
  onSessionOriginChannel,
  onSessionHandshakeChannel,
  onSessionGoawayChannel,
  onSessionEarlyRejectedChannel,
  onStreamClosedChannel,
  onStreamHeadersChannel,
  onStreamTrailersChannel,
  onStreamInfoChannel,
  onStreamResetChannel,
  onStreamBlockedChannel,
  onSessionErrorChannel,
  onEndpointConnectChannel
};

/* c8 ignore stop */

