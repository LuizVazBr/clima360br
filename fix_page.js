const fs = require('fs');
let c = fs.readFileSync('src/app/page.js', 'utf8');
const mpContent = `
              {role === 'mp' && (
                <>
                  <div className="widget-glass-static flex-card">
                    <div className="widget-header"><AlertTriangle size={18} style={{color:'#ef4444'}} /><h3 className="widget-title">Demandas Locais (Varejo)</h3></div>
                    <div className="widget-body">
                      <div className="huge-number" style={{color: '#ef4444'}}>{tcuData.ouvidoria.length || '—'}</div>
                      <p className="micro-desc">Problemas reportados via Fala.BR e App</p>
                    </div>
                  </div>

                  <div className="widget-glass-static flex-card">
                    <div className="widget-header"><TrendingUp size={18} className="text-blue" /><h3 className="widget-title">Ações Civis Públicas (ACP)</h3></div>
                    <div className="widget-body" style={{gap: '8px'}}>
                      <div className="data-row">
                        <span className="label">Em andamento</span>
                        <span className="value bold" style={{color: '#F59E0B'}}>12</span>
                      </div>
                      <div className="data-row">
                        <span className="label">Concluídas (2025)</span>
                        <span className="value bold" style={{color: '#10B981'}}>4</span>
                      </div>
                      <div className="data-row">
                        <span className="label">TACs Firmados</span>
                        <span className="value bold" style={{color: '#3B82F6'}}>8</span>
                      </div>
                    </div>
                  </div>

                  <div className="widget-glass-static flex-card">
                    <div className="widget-header"><Map size={18} className="text-purple" /><h3 className="widget-title">Ouvidoria MPDFT (Recentes)</h3></div>
                    <div className="widget-body" style={{gap: '8px'}}>
                      {tcuData.ouvidoria.length > 0 ? tcuData.ouvidoria.slice(0, 5).map((d, i) => (
                        <div key={i} className="data-row" style={{ alignItems: 'flex-start' }}>
                          <span className="label" style={{ flex: 1 }}>
                            <strong>{d.protocolo || 'OUV'}</strong><br/>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.assunto_nome} - {d.bairro}</span>
                          </span>
                          <span className="value bold" style={{ fontSize: '11px', background: '#3b82f620', padding: '2px 6px', borderRadius: '4px', color: '#3b82f6' }}>Autuar</span>
                        </div>
                      )) : <p className="micro-desc">Carregando...</p>}
                    </div>
                  </div>
                </>
              )}
`;

c = c.replace('              {/* ESG Partners (TCU cadastra) */}', mpContent + '\n              {/* ESG Partners (TCU cadastra) */}');
fs.writeFileSync('src/app/page.js', c);
