import { faCheckCircle, faCircleNotch, faExternalLinkAlt, faExclamationTriangle, faStar, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { formatDate } from "../../../../utils/formatDate";
import styles from "./PublicationPerformance.module.css";

const LEVEL_STYLE = {
    good: { cls: styles.level_good, label: "Profesional" },
    medium: { cls: styles.level_medium, label: "Estándar" },
    bad: { cls: styles.level_bad, label: "Básica" },
};

function ScoreRing({ score }) {
    const r = 28;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 66 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <svg width={72} height={72} className={styles.ring_svg}>
            <circle cx={36} cy={36} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6} />
            <circle
                cx={36} cy={36} r={r}
                fill="none"
                stroke={color}
                strokeWidth={6}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
            <text x={36} y={40} textAnchor="middle" fontSize={14} fontWeight={700} fill={color}>
                {score}
            </text>
        </svg>
    );
}

function RuleRow({ rule }) {
    const done = rule.status === "COMPLETED";
    const isWarning = rule.mode === "WARNING";
    return (
        <div className={`${styles.rule} ${done ? styles.rule_done : isWarning ? styles.rule_warn : styles.rule_pending}`}>
            <FontAwesomeIcon
                icon={done ? faCheckCircle : faExclamationTriangle}
                className={styles.rule_icon}
            />
            <div className={styles.rule_body}>
                <p className={styles.rule_title}>{rule.wordings?.title}</p>
                {!done && rule.wordings?.link && (
                    <a
                        href={rule.wordings.link}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.rule_link}
                    >
                        {rule.wordings.label} <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                )}
            </div>
            {!done && (
                <div className={styles.rule_progress_wrap}>
                    <div className={styles.rule_progress_bar}>
                        <div
                            className={`${styles.rule_progress_fill} ${isWarning ? styles.fill_warn : styles.fill_pending}`}
                            style={{ width: `${Math.round((rule.progress ?? 0) * 100)}%` }}
                        />
                    </div>
                    <span className={styles.rule_pct}>{Math.round((rule.progress ?? 0) * 100)}%</span>
                </div>
            )}
        </div>
    );
}

function BucketSection({ bucket }) {
    const [open, setOpen] = useState();
    const pendingCount = bucket.variables?.filter(v => v.status === "PENDING").length ?? 0;

    return (
        <div className={styles.bucket}>
            <button className={styles.bucket_header} onClick={() => setOpen(o => !o)}>
                <div className={styles.bucket_left}>
                    <span className={`${styles.bucket_dot} ${bucket.status === "COMPLETED" ? styles.dot_done : styles.dot_pending}`} />
                    <span className={styles.bucket_title}>{bucket.title}</span>
                    {pendingCount > 0 && (
                        <span className={styles.bucket_badge}>{pendingCount} pendiente{pendingCount > 1 ? "s" : ""}</span>
                    )}
                </div>
                <span className={styles.bucket_score}>{Math.round(bucket.score)}%</span>
            </button>

            {open && (
                <div className={styles.bucket_body}>
                    {bucket.variables?.map(variable => (
                        <div key={variable.key} className={styles.variable}>
                            <p className={styles.variable_title}>{variable.title}</p>
                            {variable.rules?.map(rule => (
                                <RuleRow key={rule.key} rule={rule} />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function PublicationPerformance({ mlItemId, mlService, reload }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await mlService.getPublicationPerformance(mlItemId);
                setData(Object.keys(res).length > 0 ? res : null);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [mlItemId, reload]);

    if (loading) return (
        <div className={styles.card}>
            <p className={styles.card_title}><FontAwesomeIcon icon={faStar} /> Calidad de publicación</p>
            <div className={styles.loading}><FontAwesomeIcon icon={faCircleNotch} spin /></div>
        </div>
    );

    if (error || !data) return (
        <div className={styles.card}>
            <p className={styles.card_title}><FontAwesomeIcon icon={faStar} /> Calidad de publicación</p>
            <p className={styles.no_data}>Datos de calidad no disponibles aún para esta publicación.</p>
        </div>
    );

    const levelInfo = LEVEL_STYLE[data.level] ?? LEVEL_STYLE.Bad;
    const pendingBuckets = data.buckets?.filter(b => b.status === "PENDING") ?? [];

    return (
        <div className={`${styles.card} ${!open ? styles.card_collapsed : ""}`} onClick={!open ? () => setOpen(true) : undefined}>
            {open ?
                <>
                    <p className={styles.card_title}>
                        <FontAwesomeIcon icon={faStar} /> Calidad de publicación
                        <button className={styles.toggle_btn} onClick={() => setOpen(false)}>
                            <FontAwesomeIcon icon={faChevronUp} />
                        </button>
                    </p>

                    {/* Score header */}
                    <div className={styles.score_header}>
                        <ScoreRing score={data.score} />
                        <div className={styles.score_info}>
                            <span className={`${styles.level_badge} ${levelInfo.cls}`}>{levelInfo.label}</span>
                            <p className={styles.score_sub}>
                                {pendingBuckets.length === 0
                                    ? "¡Todos los objetivos cumplidos!"
                                    : `${pendingBuckets.length} sección${pendingBuckets.length > 1 ? "es" : ""} con mejoras pendientes`
                                }
                            </p>
                            <p className={styles.calc_date}>
                                Actualizado: {formatDate(data.calculated_at, "short", true)}
                            </p>
                        </div>
                    </div>

                    {/* Buckets */}
                    <div className={styles.buckets}>
                        {data.buckets?.map(bucket => (
                            <BucketSection key={bucket.key} bucket={bucket} />
                        ))}
                    </div>
                </> :
                <ScoreRing score={data.score} />
            }
        </div>
    );
}