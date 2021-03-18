## Constants

<dl>
<dt><a href="#gcpSecretsPattern">gcpSecretsPattern</a></dt>
<dd><p>GCP Secrets Manager format</p>
<p>E.g. gcp-secrets://projects/my-project-id/secrets/my-secret/versions/latest</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#retrieveGcpSecret">retrieveGcpSecret(projectId, secretName, secretVersion)</a> ⇒ <code>string</code> | <code>undefined</code></dt>
<dd><p>Function to retrieve the GCP Secrets Manager version specified by project ID, name, and version.</p></dd>
<dt><a href="#resolveEnv">resolveEnv()</a></dt>
<dd><p>Resolves any secret environment variables, and sets them in the environment.</p></dd>
</dl>

<a name="gcpSecretsPattern"></a>

## gcpSecretsPattern
<p>GCP Secrets Manager format</p>
<p>E.g. gcp-secrets://projects/my-project-id/secrets/my-secret/versions/latest</p>

**Kind**: global constant  
<a name="retrieveGcpSecret"></a>

## retrieveGcpSecret(projectId, secretName, secretVersion) ⇒ <code>string</code> \| <code>undefined</code>
<p>Function to retrieve the GCP Secrets Manager version specified by project ID, name, and version.</p>

**Kind**: global function  
**Returns**: <code>string</code> \| <code>undefined</code> - <ul>
<li>Returns the value of the secret, or undefined.</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| projectId | <code>string</code> | <p>The GCP project id.</p> |
| secretName | <code>string</code> | <p>The name of the secret.</p> |
| secretVersion | <code>string</code> | <p>The version of the secret</p> |

<a name="resolveEnv"></a>

## resolveEnv()
<p>Resolves any secret environment variables, and sets them in the environment.</p>

**Kind**: global function  
