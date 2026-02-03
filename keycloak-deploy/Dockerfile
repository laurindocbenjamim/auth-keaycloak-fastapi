FROM quay.io/keycloak/keycloak:26.1.0

# Set environment for production
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_ENABLED=true
ENV KC_PROXY_HEADERS=xforwarded

# Build optimized Keycloak
RUN /opt/keycloak/bin/kc.sh build

# Start Keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]
