## Members

<dl>
<dt><a href="#awsSsmPattern">awsSsmPattern</a> ⇒ <code>string</code> | <code>undefined</code></dt>
<dd><p>Function to retrieve the AWS SSM Parameter value.</p></dd>
<dt><a href="#retrieveAwsSsmParameter">retrieveAwsSsmParameter</a></dt>
<dd><p>AWS Secrets Manager arn format</p>
<p>E.g. arn:aws:secretsmanager:us-east-1:123456789012:secret:tutorials/MyFirstSecret-jiObOV</p></dd>
<dt><a href="#awsSecretsManagerPattern">awsSecretsManagerPattern</a> ⇒ <code>string</code> | <code>undefined</code></dt>
<dd><p>Function to retrieve the AWS Secrets Manager SecretString value.</p></dd>
<dt><a href="#gcpSecretsPattern">gcpSecretsPattern</a> ⇒ <code>string</code> | <code>undefined</code></dt>
<dd><p>Function to retrieve the GCP Secrets Manager version specified by project ID, name, and version.</p></dd>
</dl>

## Constants

<dl>
<dt><a href="#secretResolverMap">secretResolverMap</a></dt>
<dd><p>Create a map of secret patterns -&gt; resolver functions</p></dd>
<dt><a href="#awsSsmPattern">awsSsmPattern</a></dt>
<dd><p>AWS SSM arn format</p>
<p>E.g. aws-ssm://arn:aws:ssm:us-east-2:123456789:parameter/my/parameter:encrypted</p></dd>
<dt><a href="#gcpSecretsPattern">gcpSecretsPattern</a></dt>
<dd><p>GCP Secrets format</p>
<p>E.g. gcp-secrets://projects/my-project-id/secrets/my-secret/versions/latest</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#resolveEnv">resolveEnv()</a></dt>
<dd><p>Resolves any secret environment variables, and sets them in the environment.</p></dd>
</dl>

<a name="awsSsmPattern"></a>

## awsSsmPattern ⇒ <code>string</code> \| <code>undefined</code>

<p>Function to retrieve the AWS SSM Parameter value.</p>

**Kind**: global variable  
**Returns**: <code>string</code> \| <code>undefined</code> - <ul>
<li>Returns the value of the secret, or undefined.</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| match | <code>RegExpMatchArray</code> | <p>The RegEx match object.</p> |

<a name="retrieveAwsSsmParameter"></a>

## retrieveAwsSsmParameter

<p>AWS Secrets Manager arn format</p>
<p>E.g. arn:aws:secretsmanager:us-east-1:123456789012:secret:tutorials/MyFirstSecret-jiObOV</p>

**Kind**: global variable  
<a name="awsSecretsManagerPattern"></a>

## awsSecretsManagerPattern ⇒ <code>string</code> \| <code>undefined</code>

<p>Function to retrieve the AWS Secrets Manager SecretString value.</p>

**Kind**: global variable  
**Returns**: <code>string</code> \| <code>undefined</code> - <ul>
<li>Returns the value of the secret, or undefined.</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| match | <code>RegExpMatchArray</code> | <p>The RegEx match object.</p> |

<a name="gcpSecretsPattern"></a>

## gcpSecretsPattern ⇒ <code>string</code> \| <code>undefined</code>

<p>Function to retrieve the GCP Secrets Manager version specified by project ID, name, and version.</p>

**Kind**: global variable  
**Returns**: <code>string</code> \| <code>undefined</code> - <ul>
<li>Returns the value of the secret, or undefined.</li>
</ul>  

| Param | Type | Description |
| --- | --- | --- |
| match | <code>RegExpMatchArray</code> | <p>The RegEx match object.</p> |

<a name="secretResolverMap"></a>

## secretResolverMap

<p>Create a map of secret patterns -&gt; resolver functions</p>

**Kind**: global constant  
<a name="awsSsmPattern"></a>

## awsSsmPattern

<p>AWS SSM arn format</p>
<p>E.g. aws-ssm://arn:aws:ssm:us-east-2:123456789:parameter/my/parameter:encrypted</p>

**Kind**: global constant  
<a name="gcpSecretsPattern"></a>

## gcpSecretsPattern

<p>GCP Secrets format</p>
<p>E.g. gcp-secrets://projects/my-project-id/secrets/my-secret/versions/latest</p>

**Kind**: global constant  
<a name="resolveEnv"></a>

## resolveEnv()

<p>Resolves any secret environment variables, and sets them in the environment.</p>

**Kind**: global function  
