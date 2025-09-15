const { analyzeMetafile, build } = require('esbuild');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// Use current directory

// Read package.json to get version
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

// Parse command line arguments
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const isAnalyze = args.includes('--analyze');

const commonConfig = {
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  bundle: true,
  minify: false,
  sourcemap: isDev,
  external: [],
  banner: {
    js: `// ${packageJson.name} v${packageJson.version}`
  },
  define: {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
  },
  logLevel: 'info',
  metafile: isAnalyze,
  // Optimize for smaller bundle size
  treeShaking: true,
  drop: [],
  // Keep only necessary Node.js built-ins
  conditions: ['node'],
  mainFields: ['main', 'module'],
  // Optimize imports
  splitting: false,
  chunkNames: '[name]-[hash]'
};

const builds = [
      {
        entryPoints: ['src/bin-simple.cjs'],
        outfile: 'dist/bin-simple.cjs',
        ...commonConfig
      },
  {
    entryPoints: ['src/bin/fopen-handler-simple.js'],
    outfile: 'dist/bin/fopen-handler-simple.cjs',
    ...commonConfig
  }
];

async function buildAll() {
  const mode = isDev ? 'development' : isAnalyze ? 'analysis' : 'production';
  console.log(`🔨 Building with esbuild (${mode} mode)...`);
  
  try {
    const results = await Promise.all(
      builds.map(config => build(config))
    );
    
    console.log('✅ Build completed successfully!');
    
    // Log build results
    results.forEach((result, index) => {
      const config = builds[index];
      if (result.metafile) {
        const output = Object.values(result.metafile.outputs)[0];
        const size = output ? output.bytes / 1024 : 0;
        console.log(`  📦 ${config.entryPoints[0]} → ${config.outfile} (${size.toFixed(1)}KB)`);
      } else {
        console.log(`  📦 ${config.entryPoints[0]} → ${config.outfile}`);
      }
    });
    
    // Generate bundle analysis if requested
    if (isAnalyze) {
      console.log('\n📊 Generating bundle analysis...');
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const config = builds[i];
        if (result.metafile) {
          const analysis = await analyzeMetafile(result.metafile, {
            verbose: true
          });
          const analysisFile = config.outfile.replace('.cjs', '.analysis.txt');
          writeFileSync(analysisFile, analysis);
          console.log(`  📈 Analysis saved to ${analysisFile}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildAll();
