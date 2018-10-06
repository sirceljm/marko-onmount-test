require("marko/node-require").install();

function serverStart(){
    // process.env.MARKO_DEBUG = true; // if this is not set it triggers MarkoJS dist build with --prod flag which produces an error
    // process.env.NODE_ENV = "dev";
    // process.env.STAGE = "dev";

    const express = require("express");
    const app = express();

    const markoExpress = require("marko/express");
    const lasso = require("lasso");

    // Configure lasso to control how JS/CSS/etc. is delivered to the browser
    lasso.configure({
        // urlPrefix: "/static",
        plugins: [
            "lasso-marko"
        ],
        resolveCssUrls: false,
        outputDir: "./static", // Place all generated JS/CSS/etc. files into the "static" dir
        bundlingEnabled: false, // Only enable bundling in production
        minify: false, // Only minify JS and CSS code in production
        fingerprintsEnabled: false, // Only add fingerprints to URLs in production,
        require: {
            transforms: [{
                transform: "lasso-babel-transform",
                config: {
                    extensions: [".marko", ".js", ".es6"],
                    // directly specify babel options
                    babelOptions: {
                        presets: [ "es2015" ]
                    }
                }
            }]
        },
    });

    let lassoPageOptions = {
        name: "index",
        dependencies: [
            "require-run: ./src/pages/root/index.marko",
        ]
    };

    app.use(require("lasso/middleware").serveStatic());

    app.use(markoExpress());
    app.disable("view cache");

    app.get("/", function(req, res) {
        lasso.lassoPage(lassoPageOptions).then(function(lassoPageResult) {
            let js = lassoPageResult.getBodyHtml();
            let css = lassoPageResult.getHeadHtml();

            // console.log(js, css);

            res.marko(require("./src/pages/root/index.marko"), {
                $global:{
                    injectJS: js,
                    injectCSS: css
                }
            });
        });
    });

    app.listen(8080, function() {
        console.log("Server started! Try it out:\nhttp://localhost:" + 8080 + "/");

        if (process.send) {
            process.send("online");
        }
    });
}

serverStart();
