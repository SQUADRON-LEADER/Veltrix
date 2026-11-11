{{/*
Fail early on an unknown color.
*/}}
{{- define "veltrix.validate" -}}
{{- if not (has .Values.color (list "blue" "green")) -}}
{{- fail (printf "color must be 'blue' or 'green', got %q" .Values.color) -}}
{{- end -}}
{{- if not (has .Values.stable.activeColor (list "blue" "green")) -}}
{{- fail (printf "stable.activeColor must be 'blue' or 'green', got %q" .Values.stable.activeColor) -}}
{{- end -}}
{{- end -}}

{{/*
Selector labels. Call with (dict "root" $ "component" "backend" "env" "blue").
*/}}
{{- define "veltrix.selectorLabels" -}}
app: veltrix
component: {{ .component }}
env: {{ .env }}
{{- end -}}

{{/*
Common labels for color-specific objects.
*/}}
{{- define "veltrix.labels" -}}
{{ include "veltrix.selectorLabels" (dict "component" .component "env" .root.Values.color) }}
app.kubernetes.io/name: veltrix
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/managed-by: {{ .root.Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .root.Chart.Name .root.Chart.Version }}
{{- end -}}
