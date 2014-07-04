import module namespace jdbc = "http://www.zorba-xquery.com/modules/jdbc";
import module namespace js = "http://jsoniq.org/functions";

let $config := { "url" : "jdbc:mysql://localhost/zm", "user" : "root", "password" : "pass" },
	$uri := jdbc:connect($config),
	$query := "SELECT * FROM Logs"
return
	<table>
		{	
			for $row in jdbc:execute-query($uri,$query)
			return 
				<tr>
					{for $key in js:keys($row) return <td>{$row($key)}</td>}
				</tr>
		}
	</table>
