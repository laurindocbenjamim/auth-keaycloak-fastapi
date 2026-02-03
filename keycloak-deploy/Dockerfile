FROM quay.io/keycloak/keycloak:26.1.0

# Configurações de Build
ENV KC_DB=postgres
ENV KC_CACHE=local
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Executa o build otimizado
RUN /opt/keycloak/bin/kc.sh build

# Configurações de Runtime
ENV KC_HTTP_ENABLED=true
ENV KC_PROXY=edge

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]