/*
Credit: Andrew Hedges, andrew@hedges.name
https://andrew.hedges.name/experiments/levenshtein/
-----------------------------------------------------------------------------
*/

var levenshteinenator = (function () {

	/**
	 * @param String a
	 * @param String b
	 * @return Array
	 */
	function levenshteinenator(a, b) {
		var cost;
		var m = a.length;
		var n = b.length;

		// make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
		if (m < n) {
			var c = a; a = b; b = c;
			var o = m; m = n; n = o;
		}

		var r = []; r[0] = [];
		for (var c = 0; c < n + 1; ++c) {
			r[0][c] = c;
		}

		for (var i = 1; i < m + 1; ++i) {
			r[i] = []; r[i][0] = i;
			for ( var j = 1; j < n + 1; ++j ) {
                //console.log("levenshteinenator " + a.charAt(i-1), b.charAt(j-1));
				cost = a.charAt( i - 1 ) === b.charAt( j - 1 ) ? 0 : 1;
				r[i][j] = minimator( r[i-1][j] + 1, r[i][j-1] + 1, r[i-1][j-1] + cost );
			}
		}

		return r[m][n];
	}

	/**
	 * Return the smallest of the three numbers passed in
	 * @param Number x
	 * @param Number y
	 * @param Number z
	 * @return Number
	 */
	function minimator(x, y, z) {
		if (x <= y && x <= z) return x;
		if (y <= x && y <= z) return y;
		return z;
    }

	return levenshteinenator;

}());
