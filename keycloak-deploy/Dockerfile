FROM quay.io/keycloak/keycloak:26.1.0

# Configurações de Build (Essenciais para o comando build)
ENV KC_DB=postgres

# Executa o build para otimizar o tempo de inicialização
RUN /opt/keycloak/bin/kc.sh build

# O ENTRYPOINT padrão já aponta para o kc.sh
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

# Mudança crucial: Use apenas "start" e confie nas variáveis do Render
CMD ["start", "--optimized"]